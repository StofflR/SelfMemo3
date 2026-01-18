import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  if(!session?.user?.id) {
    return new NextResponse('Unauthorized', {status: 401});
  }

  const reminders = await request.json();

  const user = await prisma.user.findUnique({
    where: {id: session.user.id},
    select: {role: true}
  })

  const isAdmin = user?.role === 'admin';

  const imported = [];
  for (const reminder of reminders) {
    const created = await prisma.reminder.create({
      data: {
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
      }
    });
    imported.push(created);
  }

  return NextResponse.json({
    success: true,
    count: imported.length
  })
}