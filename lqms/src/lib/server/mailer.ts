import nodemailer from 'nodemailer';
import { SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM } from '$env/static/private';

export async function sendRegistrationMail(to: string, username: string) {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false, // nur true für Port 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: SMTP_FROM,
    to,
    subject: 'Willkommen bei LQMS!',
    html: `<h3>Hallo ${username},</h3><p>Danke für deine Registrierung bei LQMS.</p><p>Viel Erfolg beim Lernen!</p>`,
  };

  await transporter.sendMail(mailOptions);
}