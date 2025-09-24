import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Doctor Patient Portal" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to,
      subject,
      html,
      text:
        text || (typeof html === "string" ? html.replace(/<[^>]*>/g, "") : ""), // Strip HTML for text version
    });

    console.log("  Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("  Email sending failed:", error);
    return { success: false, error: error.message };
  }
}

// Email templates
export const emailTemplates = {
  appointmentBooked: (
    patientName: string,
    doctorName: string,
    appointmentDate: string,
    timeSlot: string
  ) => ({
    subject: "Appointment Booked Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmation</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment has been successfully booked with <strong>Dr. ${doctorName}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Appointment Details:</h3>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${timeSlot}</p>
          <p><strong>Status:</strong> Pending Approval</p>
        </div>
        
        <p>Please wait for the doctor to approve your appointment. You will receive another email once it's confirmed.</p>
        <p>If you need to cancel or have any questions, please contact us.</p>
        
        <p>Best regards,<br>Doctor Patient Portal Team</p>
      </div>
    `,
  }),

  appointmentApproved: (
    patientName: string,
    doctorName: string,
    appointmentDate: string,
    timeSlot: string,
    clinicAddress: string
  ) => ({
    subject: "Appointment Approved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Appointment Approved</h2>
        <p>Dear ${patientName},</p>
        <p>Great news! Your appointment with <strong>Dr. ${doctorName}</strong> has been approved.</p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #065f46;">Confirmed Appointment Details:</h3>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${timeSlot}</p>
          <p><strong>Clinic Address:</strong> ${clinicAddress}</p>
        </div>
        
        <p>Please arrive 15 minutes before your scheduled time. Don't forget to bring any relevant medical documents.</p>
        
        <p>Best regards,<br>Doctor Patient Portal Team</p>
      </div>
    `,
  }),

  appointmentRejected: (
    patientName: string,
    doctorName: string,
    appointmentDate: string,
    timeSlot: string
  ) => ({
    subject: "Appointment Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Appointment Update</h2>
        <p>Dear ${patientName},</p>
        <p>We regret to inform you that your appointment with <strong>Dr. ${doctorName}</strong> scheduled for ${appointmentDate} at ${timeSlot} could not be confirmed.</p>
        
        <p>This might be due to:</p>
        <ul>
          <li>Doctor's unavailability</li>
          <li>Emergency scheduling conflicts</li>
          <li>Other unforeseen circumstances</li>
        </ul>
        
        <p>We apologize for any inconvenience. Please feel free to book another appointment at a different time.</p>
        
        <p>Best regards,<br>Doctor Patient Portal Team</p>
      </div>
    `,
  }),

  appointmentRescheduled: (
    patientName: string,
    doctorName: string,
    oldDate: string,
    oldTime: string,
    newDate: string,
    newTime: string
  ) => ({
    subject: "Appointment Rescheduled",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Appointment Rescheduled</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been rescheduled.</p>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400e;">Updated Appointment Details:</h3>
          <p><strong>Previous:</strong> ${oldDate} at ${oldTime}</p>
          <p><strong>New Date:</strong> ${newDate}</p>
          <p><strong>New Time:</strong> ${newTime}</p>
        </div>
        
        <p>Please make note of the new date and time. We apologize for any inconvenience caused.</p>
        
        <p>Best regards,<br>Doctor Patient Portal Team</p>
      </div>
    `,
  }),

  appointmentReminder: (
    patientName: string,
    doctorName: string,
    appointmentDate: string,
    timeSlot: string,
    clinicAddress: string
  ) => ({
    subject: "Appointment Reminder - Tomorrow",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Appointment Reminder</h2>
        <p>Dear ${patientName},</p>
        <p>This is a friendly reminder about your upcoming appointment with <strong>Dr. ${doctorName}</strong> tomorrow.</p>
        
        <div style="background-color: #ede9fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #5b21b6;">Appointment Details:</h3>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${timeSlot}</p>
          <p><strong>Clinic Address:</strong> ${clinicAddress}</p>
        </div>
        
        <p><strong>Important reminders:</strong></p>
        <ul>
          <li>Arrive 15 minutes early</li>
          <li>Bring a valid ID and insurance card</li>
          <li>Bring any relevant medical documents</li>
          <li>Prepare a list of current medications</li>
        </ul>
        
        <p>If you need to cancel or reschedule, please do so as soon as possible.</p>
        
        <p>Best regards,<br>Doctor Patient Portal Team</p>
      </div>
    `,
  }),
};
