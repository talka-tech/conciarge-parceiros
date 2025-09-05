import nodemailer from 'nodemailer';

// Configuração do email (você precisará configurar as variáveis de ambiente)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const emailService = {
  // Enviar notificação para Victor sobre novo parceiro
  async sendNewPartnerNotification(partnerData: {
    name: string;
    email: string;
    company_name: string;
    company_type: string;
    phone?: string;
  }) {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'admin@talka.tech',
      subject: 'Nova Solicitação de Parceria - ConverseIA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nova Solicitação de Parceria</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Dados do Solicitante:</h3>
            <p><strong>Nome:</strong> ${partnerData.name}</p>
            <p><strong>Email:</strong> ${partnerData.email}</p>
            <p><strong>Empresa:</strong> ${partnerData.company_name}</p>
            <p><strong>Tipo:</strong> ${partnerData.company_type}</p>
            ${partnerData.phone ? `<p><strong>Telefone:</strong> ${partnerData.phone}</p>` : ''}
          </div>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              📝 Acesse o painel administrativo para aprovar ou rejeitar esta solicitação:
            </p>
            <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/parceria/admin" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
              Acessar Painel Admin
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            Este e-mail foi enviado automaticamente pelo sistema de parceiros da ConverseIA.
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email de notificação enviado para Victor');
    } catch (error) {
      console.error('Erro ao enviar email para Victor:', error);
    }
  },

  // Enviar email de aprovação para o parceiro
  async sendApprovalNotification(partnerData: {
    name: string;
    email: string;
    company_name: string;
  }) {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: partnerData.email,
      subject: '🎉 Sua conta de parceiro foi aprovada - ConverseIA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Parabéns!</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 18px;">Sua conta de parceiro foi aprovada</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">
              Olá <strong>${partnerData.name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #334155; line-height: 1.6;">
              Ótimas notícias! Sua solicitação para se tornar parceiro da <strong>ConverseIA</strong> foi aprovada. 
              Agora você pode acessar todos os recursos e benefícios do nosso programa de parceiros.
            </p>
            
            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">O que você pode fazer agora:</h3>
              <ul style="color: #1e40af; line-height: 1.8;">
                <li>Acessar seu painel de parceiro</li>
                <li>Baixar materiais de vendas</li>
                <li>Gerenciar seus clientes e leads</li>
                <li>Acompanhar suas comissões</li>
                <li>Ver simulações de ganhos</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/parceria/login" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Acessar Meu Painel
              </a>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #475569; font-size: 14px;">
                <strong>Empresa:</strong> ${partnerData.company_name}<br>
                <strong>Email:</strong> ${partnerData.email}
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Bem-vindo à família ConverseIA! Estamos ansiosos para trabalhar juntos.
            </p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email de aprovação enviado para o parceiro');
    } catch (error) {
      console.error('Erro ao enviar email de aprovação:', error);
    }
  },

  // Enviar email de rejeição para o parceiro
  async sendRejectionNotification(partnerData: {
    name: string;
    email: string;
  }) {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: partnerData.email,
      subject: 'Atualização sobre sua solicitação de parceria - ConverseIA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 12px;">
            <h2 style="color: #dc2626; margin-top: 0;">Atualização sobre sua solicitação</h2>
            
            <p style="font-size: 16px; color: #334155;">
              Olá <strong>${partnerData.name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #334155; line-height: 1.6;">
              Agradecemos seu interesse em se tornar parceiro da ConverseIA. 
              Após análise, não foi possível aprovar sua solicitação no momento.
            </p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin: 25px 0;">
              <p style="margin: 0; color: #991b1b;">
                Isso não significa que não valorizamos seu interesse. Você pode enviar uma nova solicitação no futuro.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Se tiver dúvidas, entre em contato conosco em contato@converseia.com
            </p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email de rejeição enviado para o parceiro');
    } catch (error) {
      console.error('Erro ao enviar email de rejeição:', error);
    }
  }
};
