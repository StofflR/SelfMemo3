import { Reminder } from "@prisma/client";
import nodemailer from 'nodemailer';
import { UserService } from "./UserService";
import { ReminderService } from "./ReminderService";
import templates from 'public/email-template.json';

type TemplateType = {
  subject: string;
  body: string;
};

type TemplateSet = {
  reminder: TemplateType;
  warning: TemplateType;
};

type Templates = {
  [key: string]: TemplateSet;
};

export class NotificationService {
  private static instance: NotificationService;
  private static notificationTemplates: Templates;

  private constructor() {
    NotificationService.notificationTemplates = templates as Templates;
  }

  public static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }

    return NotificationService.instance;
  }

  async sendNotification(reminder: Reminder, isWarning: boolean = false) {
    console.log(`Triggering reminder: ${reminder.id}`);

    var smtpTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const templateSet = NotificationService.notificationTemplates[reminder.emailTemplate] || NotificationService.notificationTemplates["default"];
    const template = isWarning ? templateSet.warning : templateSet.reminder;

    let subject = template.subject.replace('{{reminderName}}', reminder.name);

    const userService = UserService.getInstance();
    const user = await userService.getUserById(reminder.userId);

    let body = template.body
      .replace('{{firstName}}', user?.firstName || '')
      .replace('{{lastName}}', user?.lastName || '')
      .replace('{{description}}', reminder.description);

    smtpTransport.sendMail(
      {
        from: process.env.SMTP_MAIL,
        to: user?.email,
        subject: subject,
        text: body,
      },
      function (error, response) {
        if (error) {
          console.error(error);
        } else {
          console.log({
            from: process.env.SMTP_MAIL,
            to: user?.email,
            subject: subject,
            text: body
          });
          console.log("Message sent: " + response);
        }
      }
    );

    // Update lastSent field
    if (!isWarning) {
      const reminderService = ReminderService.getInstance();
      reminderService.updateReminderLastSent(reminder.id, Math.round((new Date().getTime() / 1000)));
    }
  }

  async checkIfReminderShouldBeNotified(date: Date, reminder: Reminder) {
    const reminderTimestamps = await ReminderService.getInstance().getReminderTimestamps(date, reminder);
    reminderTimestamps.forEach(async (reminderTimestamp) => {
      // Convert timestamp to Date in the reminder's timezone (or default to CET for legacy reminders)
      const timezone = reminder.timezone || 'Europe/Berlin';

      // Create a date object from the reminder timestamp
      const reminderDate = new Date(reminderTimestamp.timestamp * 1000);

      // Convert current date to the reminder's timezone for comparison
      const dateInTimezone = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
      const reminderDateInTimezone = new Date(reminderDate.toLocaleString('en-US', { timeZone: timezone }));

      if (
        dateInTimezone.getFullYear() === reminderDateInTimezone.getFullYear() &&
        dateInTimezone.getMonth() === reminderDateInTimezone.getMonth() &&
        dateInTimezone.getDate() === reminderDateInTimezone.getDate() &&
        dateInTimezone.getHours() === reminderDateInTimezone.getHours() &&
        dateInTimezone.getMinutes() === reminderDateInTimezone.getMinutes()
      ) {
        this.sendNotification(reminder, reminderTimestamp.isWarning);
      }
    });
  }
};
