import nodemailer from "nodemailer"; // Importa o nodemailer, que é utilizado para enviar e-mails
import dotenv from "dotenv"; 

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env para o processo

// Cria um transporte SMTP com as credenciais definidas nas variáveis de ambiente
const transporter = nodemailer.createTransport({
  service: "gmail", // Define o serviço de e-mail como Gmail (pode ser modificado para outro serviço)
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

// Função assíncrona para enviar o e-mail de recuperação de senha
export async function sendRecoveryEmail(to: string, token: string) {
  try {
    // Envia o e-mail com o código de recuperação para o usuário
    await transporter.sendMail({
      from: `"Suporte AgendAPP" <${process.env.SMTP_USER}>`, // Define o remetente do e-mail com o nome e e-mail do suporte
      to, // Destinatário do e-mail (recebe o e-mail para o qual enviar a recuperação)
      subject: "Recuperação de Senha", // Assunto do e-mail
      text: `Olá,

        Recebemos uma solicitação para redefinir sua senha. Para continuar com o processo, por favor, utilize o código de recuperação abaixo:

        Código de Recuperação: ${token}

        Se você não solicitou a redefinição de senha, por favor, ignore este e-mail.

        Atenciosamente,
        Equipe de Suporte AgendAPP`, // Corpo do e-mail em formato de texto (sem HTML)

      // Corpo do e-mail em formato HTML para maior formatação
      html: `<p>Olá,</p>
<p>Recebemos o seu pedido para redefinir a senha. Para continuar, por favor, utilize o código de recuperação abaixo:</p>
<p><strong>Código de Recuperação: ${token}</strong></p>
<p>Se você não solicitou a redefinição de senha, não se preocupe, apenas ignore este e-mail.</p>
<p>Estamos aqui para ajudar caso precise de qualquer coisa.</p>
<p>Abraços,<br>Equipe de Suporte AgendAPP</p>`,
    });
  } catch (error) {
    // Caso ocorra algum erro durante o envio do e-mail, é logado no console
    console.error("Erro ao enviar e-mail:", error);
  }
}
