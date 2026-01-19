import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { ReminderService } from 'services/ReminderService';
import { UserService } from 'services/UserService';

export async function POST(request: Request) {
  const session = await auth();
  if(!session?.user?.id) {
    return new NextResponse('Unauthorized', {status: 401});
  }

  const reminders = await request.json();

  const userService = UserService.getInstance();
  const reminderService = ReminderService.getInstance();

  const user = await userService.getUserById(session.user.id);

  const isAdmin = user?.role === 'admin';

  const imported = [];
  for (const reminder of reminders) {
    const created = await reminderService.createReminder({
      userId: (isAdmin && reminder.userId) ? reminder.userId : session.user.id,
      name: reminder.name,
      description: reminder.description,
      type: reminder.type,
      config: reminder.config,
      isDisabled: reminder.isDisabled || false,
      lastSent: reminder.lastSent,
      hasWarnings: reminder.hasWarnings || false,
      warningNumber: reminder.warningNumber,
      warningInterval: reminder.warningInterval,
      warningIntervalNumber: reminder.warningIntervalNumber,
      timezone: reminder.timezone,
      emailTemplate: reminder.emailTemplate,
      additionalUserIds: reminder.additionalUserIds || []
    });
    imported.push(created);
  }

  return NextResponse.json({
    success: true,
    count: imported.length
  })
}