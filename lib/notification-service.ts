import { sendEmail, emailTemplates } from "./email";
import dbConnect from "./db";
import Appointment from "@/models/Appointment";
import User from "@/models/User";

export class NotificationService {
  static async sendAppointmentNotification(
    appointmentId: string,
    type: "booked" | "approved" | "rejected" | "rescheduled" | "reminder"
  ) {
    try {
      await dbConnect();

      const appointment = await Appointment.findById(appointmentId)
        .populate("patientId")
        .populate("doctorId");

      if (!appointment) {
        console.error(
          "  Appointment not found for notification:",
          appointmentId
        );
        return { success: false, error: "Appointment not found" };
      }

      // Get patient and doctor user emails
      const patientUser = await User.findById(appointment.patientId.userId);
      const doctorUser = await User.findById(appointment.doctorId.userId);

      if (!patientUser || !doctorUser) {
        console.error("  User not found for notification");
        return { success: false, error: "User not found" };
      }

      const appointmentDate = appointment.appointmentDate.toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      let emailContent;
      const recipientEmail = patientUser.email; // Default to patient

      switch (type) {
        case "booked":
          emailContent = emailTemplates.appointmentBooked(
            appointment.patientId.name,
            appointment.doctorId.name,
            appointmentDate,
            appointment.timeSlot
          );
          break;

        case "approved":
          emailContent = emailTemplates.appointmentApproved(
            appointment.patientId.name,
            appointment.doctorId.name,
            appointmentDate,
            appointment.timeSlot,
            appointment.doctorId.clinicAddress
          );
          break;

        case "rejected":
          emailContent = emailTemplates.appointmentRejected(
            appointment.patientId.name,
            appointment.doctorId.name,
            appointmentDate,
            appointment.timeSlot
          );
          break;

        case "rescheduled":
          // For rescheduled appointments, we need old date/time (would need to be passed separately)
          emailContent = emailTemplates.appointmentRescheduled(
            appointment.patientId.name,
            appointment.doctorId.name,
            "Previous Date", // This would need to be tracked separately
            "Previous Time",
            appointmentDate,
            appointment.timeSlot
          );
          break;

        case "reminder":
          emailContent = emailTemplates.appointmentReminder(
            appointment.patientId.name,
            appointment.doctorId.name,
            appointmentDate,
            appointment.timeSlot,
            appointment.doctorId.clinicAddress
          );
          break;

        default:
          return { success: false, error: "Invalid notification type" };
      }

      const result = await sendEmail({
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      console.log(
        `  ${type} notification sent for appointment:`,
        appointmentId
      );
      return result;
    } catch (error: any) {
      console.error("  Notification service error:", error);
      return { success: false, error: error.message };
    }
  }

  static async sendBulkReminders() {
    try {
      await dbConnect();

      // Get appointments for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const appointments = await Appointment.find({
        appointmentDate: {
          $gte: tomorrow,
          $lte: endOfTomorrow,
        },
        status: "approved",
      });

      console.log(
        `  Sending reminders for ${appointments.length} appointments`
      );

      const results = await Promise.allSettled(
        appointments.map((appointment) =>
          this.sendAppointmentNotification(
            appointment._id.toString(),
            "reminder"
          )
        )
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.length - successful;

      return {
        success: true,
        total: appointments.length,
        successful,
        failed,
      };
    } catch (error: any) {
      console.error("  Bulk reminder error:", error);
      return { success: false, error: error.message };
    }
  }
}
