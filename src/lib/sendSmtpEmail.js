// Envio de email via SMTP direto do frontend (Node.js libs via browserify ou webpack, apenas para uso privado)
// Requer: npm install smtp-client

import { SMTPClient } from 'smtp-client';

export async function sendSmtpEmail({
  to,
  subject,
  html,
  user,
  pass,
  smtpServer,
  smtpPort
}) {
  const client = new SMTPClient({
    host: smtpServer,
    port: Number(smtpPort),
    secure: false
  });

  await client.connect();
  await client.greet({ hostname: 'localhost' });
  await client.auth({ username: user, password: pass });
  await client.mail({ from: user });
  await client.rcpt({ to });
  await client.data({
    subject,
    from: user,
    to,
    html
  });
  await client.quit();
}

// Exemplo de uso:
// sendSmtpEmail({
//   to: 'luca@talka.tech,victor@talka.tech',
//   subject: 'Nova solicitação de parceria',
//   html: '<b>Nova solicitação de parceria!</b>',
//   user: 'contato@talka-ia.com.br',
//   pass: '368410Am#',
//   smtpServer: 'smtp.hostinger.com',
//   smtpPort: 587
// });
