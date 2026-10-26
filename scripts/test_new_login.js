async function testLogin() {
  console.log('🔑 Testando login com novas credenciais exclusivas...');
  try {
    const email = process.env.ADMIN_EMAIL || process.argv[2] || 'admin@gamastore.com';
    const password = process.env.ADMIN_PASSWORD || process.argv[3] || 'admin123';
    const targetUrl = process.env.STORE_API_URL || 'http://localhost:3001/api/auth/login';

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Resposta:', data);
  } catch (err) {
    console.error('Erro:', err);
  }
}

testLogin();
