import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if(!session?.user?.id) {
    return new NextResponse('Unauthorized', {status: 401});
  }

  const reminders = await prisma.reminder.findMany(
    {
      where: { userId: session.user.id }
    }
  );

  const jsonData = JSON.stringify(reminders, null, 2);

  return new NextResponse(jsonData, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="reminders-${new Date().toISOString().split('T')[0]}.json"`
    }
  });
}