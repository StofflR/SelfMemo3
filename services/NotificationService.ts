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
  edit: TemplateType;
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

  async sendNotification(reminder: Reminder, notificationType: 'reminder' | 'warning' | 'edit' = 'reminder') {
    console.log(`[NotificationService] Triggering reminder: ${reminder.id}`);

    var smtpTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const templateSet = NotificationService.notificationTemplates[reminder.emailTemplate] || NotificationService.notificationTemplates["default"];
    const template = templateSet[notificationType];

    let subject = template.subject.replace('{{reminderName}}', reminder.name);

    const userService = UserService.getInstance();
    const primaryUser = await userService.getUserById(reminder.userId);

    // Collect all users to send notifications to
    const usersToNotify: Array<{ email: string; firstName: string; lastName: string }> = [];

    if (primaryUser && primaryUser.email) {
      usersToNotify.push({
        email: primaryUser.email || '',
        firstName: primaryUser.firstName || '',
        lastName: primaryUser.lastName || '',
      });
    } else {
      console.warn(`[NotificationService] Primary user not found for ID: ${reminder.userId} with mail ${primaryUser?.email}`);
    }

    // Handle multi-user reminders
    if (reminder.additionalUserIds) {
      try {
        const additionalUserIds: string[] = JSON.parse(reminder.additionalUserIds);
        const validUserIds: string[] = [];

        for (const userId of additionalUserIds) {
          const user = await userService.getUserById(userId);
          if (user && user.email) {
            usersToNotify.push({
              email: user.email || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
            });
            validUserIds.push(userId);
          } else {
            console.warn(`[NotificationService] User ${userId} no longer exists, removing from reminder ${reminder.id}`);
          }
        }

        // Update reminder if some users were removed
        if (validUserIds.length !== additionalUserIds.length) {
          const reminderService = ReminderService.getInstance();
          await reminderService.updateReminder({
            ...reminder,
            additionalUserIds: validUserIds.length > 0 ? JSON.stringify(validUserIds) : null,
          });
        }
      } catch (error) {
        console.error('[NotificationService] Error parsing additionalUserIds:', error);
      }
    }

    // Calculate next notification date if template contains {{nextdate}} placeholder
    let nextDateStr = '';
    if (template.body.includes('{{nextdate}}')) {
      try {
        const reminderService = ReminderService.getInstance();
        const currentDate = new Date();
        const reminderTimestamps = await reminderService.getReminderTimestamps(currentDate, reminder);

        if (reminderTimestamps.length > 0) {
          // Find the next timestamp that is in the future
          const futureTimestamps = reminderTimestamps
            .filter(rt => rt.timestamp * 1000 > currentDate.getTime())
            .sort((a, b) => a.timestamp - b.timestamp);

          if (futureTimestamps.length > 0) {
            const nextTimestamp = futureTimestamps[0].timestamp;
            const nextDate = new Date(nextTimestamp * 1000);
            const timezone = reminder.timezone || 'Europe/Berlin';

            // Get user's date format preference
            const dateStyle = (primaryUser?.dateFormat as 'full' | 'long' | 'medium' | 'short') || 'full';

            nextDateStr = nextDate.toLocaleString('en-US', {
              timeZone: timezone,
              dateStyle: dateStyle,
              timeStyle: 'short'
            });
          } else {
            nextDateStr = 'The reminder date lies in the past';
          }
          console.log(`[NotificationService] Next notification date for reminder ${reminder.id} is ${nextDateStr}`);
        } else {
          nextDateStr = 'The reminder date lies in the past';
        }
      } catch (error) {
        console.error('[NotificationService] Error calculating next date:', error);
        nextDateStr = 'Unable to calculate next date';
      }
    }

    // Send notification to all users
    for (const user of usersToNotify) {
      console.log(`[NotificationService] Preparing email for: ${user.email}`);

      let body = template.body
        .replace('{{firstName}}', user.firstName)
        .replace('{{lastName}}', user.lastName)
        .replace('{{description}}', reminder.description)
        .replace('{{nextdate}}', nextDateStr);


      smtpTransport.sendMail(
        {
          from: process.env.SMTP_MAIL,
          to: user.email,
          subject: subject,
          text: body,
        },
        function (error, response) {
          if (error) {
            console.error(`[NotificationService] Failed to send email to ${user.email}:`, error);
          }
        }
      );
    }

    // Update lastSent field
    if (notificationType === 'reminder') {
      const timestamp = Math.round((new Date().getTime() / 1000));
      const reminderService = ReminderService.getInstance();
      reminderService.updateReminderLastSent(reminder.id, timestamp);
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
        this.sendNotification(reminder, reminderTimestamp.isWarning ? 'warning' : 'reminder');
      }
    });
  }
};
