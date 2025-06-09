import  nodemailer  from 'nodemailer';
import { createEmailVerificationToken } from '$lib/server/jwt';

export async function sendRegistrationMail(to: string, username: string, id: number) {

  const token = createEmailVerificationToken({ id, email: to });
  const verifyUrl = `https://dhbw.marcoshub.de/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // nur true für Port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Willkommen bei LQMS! - Bitte bestätige deine E-Mail-Adresse',
    html: `
      <h3>Hallo ${username},</h3>
      <p>Danke für deine Registrierung bei LQMS.</p><p>Viel Erfolg beim Lernen!</p>
      <p>Bitte bestätige deine E-Mail-Adresse durch Klick auf den folgenden Link:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Dieser Link ist 8 Stunden gültig.</p>`,
  };

  await transporter.sendMail(mailOptions);
}