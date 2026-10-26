/**
 * Rate Limiter Anti-Brute Force para Autenticação
 * Protege endpoints sensíveis (ex: /api/auth/login) contra ataques de força bruta e credential stuffing.
 */

const loginAttempts = new Map();

// Configurações padrão
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5;            // Máximo de 5 tentativas com falha por janela

// Limpeza periódica de memória a cada 10 minutos para evitar memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (now - record.firstAttemptTime > WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

export const loginRateLimiter = (req, res, next) => {
  // Ignora se não for POST /login
  if (req.method !== 'POST') return next();

  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const email = (req.body && req.body.email) ? String(req.body.email).trim().toLowerCase() : '';
  const key = `${ip}:${email}`;

  const record = loginAttempts.get(key);
  const now = Date.now();

  if (record) {
    // Se a janela de tempo expirou, reinicia a contagem
    if (now - record.firstAttemptTime > WINDOW_MS) {
      loginAttempts.delete(key);
    } else if (record.count >= MAX_ATTEMPTS) {
      const remainingSeconds = Math.ceil((record.firstAttemptTime + WINDOW_MS - now) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);

      console.warn(`[SECURITY ALERT] Tentativa de força bruta bloqueada para IP=${ip}, Email=${email}. Bloqueio de mais ${remainingMinutes} min.`);

      res.setHeader('Retry-After', remainingSeconds);
      return res.status(429).json({
        error: `Muitas tentativas incorretas. Por segurança, o acesso para esta conta foi temporariamente bloqueado. Tente novamente em ${remainingMinutes} minuto(s).`
      });
    }
  }

  // Anexa helpers na requisição para registrar sucesso ou falha
  req.rateLimit = {
    key,
    registerFailure: () => {
      const current = loginAttempts.get(key);
      if (!current) {
        loginAttempts.set(key, { count: 1, firstAttemptTime: Date.now() });
      } else {
        current.count += 1;
      }
    },
    registerSuccess: () => {
      loginAttempts.delete(key);
    }
  };

  next();
};

/**
 * Rate Limiter Anti-Spam / Anti-Flood para Criação de Pedidos (/api/orders)
 * Máximo de 20 pedidos a cada 10 minutos por IP
 */
const orderAttempts = new Map();
const ORDER_WINDOW_MS = 10 * 60 * 1000;
const MAX_ORDERS_PER_WINDOW = 20;

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of orderAttempts.entries()) {
    if (now - record.firstAttemptTime > ORDER_WINDOW_MS) {
      orderAttempts.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export const orderRateLimiter = (req, res, next) => {
  if (req.method !== 'POST') return next();

  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = orderAttempts.get(ip);

  if (record) {
    if (now - record.firstAttemptTime > ORDER_WINDOW_MS) {
      orderAttempts.set(ip, { count: 1, firstAttemptTime: now });
    } else if (record.count >= MAX_ORDERS_PER_WINDOW) {
      const waitMin = Math.ceil((record.firstAttemptTime + ORDER_WINDOW_MS - now) / 60000);
      return res.status(429).json({
        error: `Muitas solicitações de pedido consecutivas. Aguarde ${waitMin} minuto(s) para fazer um novo pedido.`
      });
    } else {
      record.count += 1;
    }
  } else {
    orderAttempts.set(ip, { count: 1, firstAttemptTime: now });
  }

  next();
};
