import { redirect } from 'next/navigation';

type Params = Promise<{ id: string }>;

export default async function ReminderDetailPage({ params }: { params: Params }) {
    const { id } = await params;
    
    redirect(`/reminders/${id}/edit`);
}