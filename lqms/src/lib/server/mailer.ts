import nodemailer from 'nodemailer';
import { createEmailVerificationToken } from '$lib/server/jwt';

/**
 * Sends a registration email with a verification link to the specified user.
 * 
 * @param to - The recipient's email address.
 * @param username - The recipient's username.
 * @param id - The recipient's user ID.
 * @returns Promise<void>
 */
export async function sendRegistrationMail(to: string, username: string, id: number) {

  // Generate a JWT token for email verification
  const token = createEmailVerificationToken({ id, email: to });
  const verifyUrl = `https://dhbw.marcoshub.de/verify-email?token=${token}`;

  // Create a transporter object using SMTP transport.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // set to true only for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Define the email options.
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

  // Send the email using the transporter.
  await transporter.sendMail(mailOptions);
}