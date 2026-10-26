import { PrismaClient } from '@prisma/client';
import { whatsappBotService } from '../services/whatsappBotService.js';

const prisma = new PrismaClient();

export const createOrder = async (req, res) => {
  try {
    const { 
      items, 
      customerName, 
      customerEmail, 
      customerPhone, 
      shippingAddress, 
      paymentMethod,
      couponCode 
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Carrinho de solicitação de materiais vazio.' });
    }

    const resolvedCustomerName = customerName?.trim() || 'Cliente WhatsApp';
    const resolvedCustomerPhone = customerPhone?.trim() || 'Origem WhatsApp Web/App';
    const resolvedCustomerEmail = customerEmail?.trim() || '';
    const resolvedShippingAddress = shippingAddress?.trim() || 'A combinar no WhatsApp';

    // Obter Configurações do Bot do Banco
    let botConfig = await prisma.botConfig.findUnique({ where: { id: 'default' } });
    if (!botConfig) {
      botConfig = { isBotEnabled: true, whatsappNumber: '5599991561407' };
    }

    let storeWhatsappPhone = (botConfig.whatsappNumber || process.env.STORE_WHATSAPP_NUMBER || '5599991561407').replace(/\D/g, '');
    if (storeWhatsappPhone.length === 10 || storeWhatsappPhone.length === 11) {
      storeWhatsappPhone = '55' + storeWhatsappPhone;
    }

    // Calcular Subtotal
    let subtotal = 0;
    const orderItemsData = [];
    const whatsappItemsList = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: `Produto ID ${item.productId} não encontrado.` });
      }
      const itemPrice = parseFloat(product.promoPrice || product.price);
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: itemPrice
      });

      whatsappItemsList.push(`- *${product.title}* (${item.quantity}x) - R$ ${itemTotal.toFixed(2).replace('.', ',')}`);
    }

    // Validar Cupom se fornecido
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() }
      });

      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * parseFloat(coupon.value)) / 100;
        } else {
          discountAmount = parseFloat(coupon.value);
        }
        discountAmount = Math.min(discountAmount, subtotal);

        // Incrementar uso do cupom
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } }
        });
      }
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);
    const orderNumber = `GS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user ? req.user.id : null,
        customerName: resolvedCustomerName,
        customerEmail: resolvedCustomerEmail,
        customerPhone: resolvedCustomerPhone,
        totalAmount: subtotal,
        discountAmount,
        finalAmount,
        status: 'PENDING',
        paymentMethod: paymentMethod || 'WHATSAPP_DIRETO',
        shippingAddress: resolvedShippingAddress,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // Formatar mensagem direta para o WhatsApp da Loja (100% imune a erros de codificação/símbolos quebrados)
    let waText = `*NOVO PEDIDO - COMANDOS ARTIGOS MILITARES*\n\n`;
    waText += `*Pedido:* ${orderNumber}\n\n`;
    waText += `*Equipamentos Selecionados:*\n${whatsappItemsList.join('\n')}\n\n`;
    if (discountAmount > 0) {
      waText += `*Cupom Ativo (${couponCode}):* -R$ ${discountAmount.toFixed(2).replace('.', ',')}\n`;
    }
    waText += `*Valor Total Estimado:* R$ ${finalAmount.toFixed(2).replace('.', ',')}\n\n`;
    if (customerName && customerName.trim() && customerName !== 'Cliente WhatsApp') {
      waText += `*Identificação:* ${customerName.trim()}\n\n`;
    }
    waText += `Olá! Acabei de separar meus materiais no site da Comandos e gostaria de finalizar a compra e entrega por aqui!`;

    const whatsappLink = `https://wa.me/${storeWhatsappPhone}?text=${encodeURIComponent(waText)}`;

    // Se o bot estiver ativado, tentar enviar mensagem automática de confirmação para o cliente
    if (botConfig.isBotEnabled) {
      try {
        const clientMsg = `✅ *PEDIDO REGISTRADO COM SUCESSO!*\n\n` +
          `Olá ${customerName}, recebemos sua solicitação de materiais (*${orderNumber}*) no valor de *R$ ${finalAmount.toFixed(2)}*.\n` +
          `Nossa equipe está processando seus itens e você receberá atualizações do status por aqui!`;
        await whatsappBotService.sendDirectMessage(customerPhone, clientMsg);
      } catch (e) {}
    }

    return res.status(201).json({
      order: newOrder,
      whatsappText: waText,
      whatsappLink,
      isBotEnabled: botConfig.isBotEnabled
    });
  } catch (error) {
    console.error('Erro ao criar pedido de materiais:', error);
    return res.status(500).json({ error: 'Erro ao processar solicitação de materiais.', details: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(orders);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar histórico de pedidos.' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Status de pedido inválido.' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true }
    });

    // Enviar mensagem automática de atualização pelo WhatsApp se o bot estiver ativo
    try {
      const botConfig = await prisma.botConfig.findUnique({ where: { id: 'default' } });
      if (botConfig && botConfig.isBotEnabled) {
        await whatsappBotService.sendOrderStatusUpdate(order);
      }
    } catch (e) {
      console.error('Erro ao notificar status via WhatsApp:', e);
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar status do pedido.' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const paidOrders = await prisma.order.aggregate({
      where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
      _sum: { finalAmount: true },
      _count: true
    });

    const pendingOrdersCount = await prisma.order.count({ where: { status: 'PENDING' } });
    const totalProductsCount = await prisma.product.count();
    const totalUsersCount = await prisma.user.count();

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, orderNumber: true, customerName: true, finalAmount: true, status: true, createdAt: true }
    });

    return res.json({
      totalRevenue: parseFloat(paidOrders._sum.finalAmount || 0),
      totalSalesCount: paidOrders._count || 0,
      totalOrders,
      pendingOrdersCount,
      totalProductsCount,
      totalUsersCount,
      recentOrders
    });
  } catch (error) {
    console.error('Erro no Analytics:', error);
    return res.status(500).json({ error: 'Erro ao carregar relatório analítico.' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({
      where: { id }
    });
    return res.json({ message: 'Pedido excluído com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir pedido.' });
  }
};
