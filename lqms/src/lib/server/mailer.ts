import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

export async function sendRegistrationMail(to: string, username: string) {
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
    subject: 'Willkommen bei LQMS!',
    html: `<h3>Hallo ${username},</h3><p>Danke für deine Registrierung bei LQMS.</p><p>Viel Erfolg beim Lernen!</p>`,
  };

  await transporter.sendMail(mailOptions);
}