import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { ReminderService } from 'services/ReminderService';
import { UserService } from 'services/UserService';

export async function GET() {
  const session = await auth();
  if(!session?.user?.id) {
    return new NextResponse('Unauthorized', {status: 401});
  }

  const userService = UserService.getInstance();
  const reminderService = ReminderService.getInstance();

  const user = await userService.getUserById(session.user.id);
  const isAdmin = user?.role === 'admin';

  const reminders = isAdmin 
    ? await reminderService.getAll()
    : await reminderService.getAllByUserId(session.user.id);

  const jsonData = JSON.stringify(reminders, null, 2);

  return new NextResponse(jsonData, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="reminders-${new Date().toISOString().split('T')[0]}.json"`
    }
  });
}