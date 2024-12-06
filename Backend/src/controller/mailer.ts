import { sendResponse, handleError } from '../utils/controllerUtils';
import nodemailer from 'nodemailer';
import { Request, Response } from 'express';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendMAilto = async(req: Request , res: Response) =>{
  try {
    const { invName, PFName, InvEMAIL, PFEMAIL, date, startTime, endTime } = req.body;

    // HTML template for the email
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meeting Scheduled</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 5px;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          .meeting-details {
            background-color: #ffffff;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin-top: 20px;
          }
          .meeting-details p {
            margin: 5px 0;
          }
          .footer {
            margin-top: 20px;
            text-align: right;
            color: #7f8c8d;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Meeting Scheduled</h1>
          <p>Dear ${invName} and ${PFName},</p>
          <p>A meeting has been scheduled between you. Please find the details below:</p>
          <div class="meeting-details">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Start Time:</strong> ${startTime}</p>
            <p><strong>End Time:</strong> ${endTime}</p>
          </div>
          <p>We look forward to a productive meeting.</p>
          <div class="footer">
            <p>Best regards,<br>Akash Sharma</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (!InvEMAIL || !PFEMAIL) {
        return sendResponse(res, 400, { message: 'Recipient emails are missing' });
      }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: [InvEMAIL, PFEMAIL],
      subject: `Meeting scheduled for ${invName} and ${PFName}`,
      html: htmlTemplate,
    };


    await transporter.sendMail(mailOptions);

    sendResponse(res, 200, { message: 'Email sent successfully' });
  } catch (error) {
    handleError(res, error);
  }
}

