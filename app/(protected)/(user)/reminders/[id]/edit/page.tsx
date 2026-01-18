import { ReminderService } from 'services/ReminderService'; 
import { notFound } from 'next/navigation';
import EditReminderClient from '@/components/ui/reminders/edit-reminder-form';
export const dynamic = 'force-dynamic';

type Params = Promise<{
      id: string
}>;

export default async function RemindersEditPage({ params }: { params: Params }) {
    const { id } = await params;

    console.log("--- EDIT PAGE LOADED ---");
    console.log("ID:", id);

    const rawReminder = await ReminderService.getInstance().getById(id);

    if (!rawReminder) {
        console.log("Reminder nicht gefunden!");
        notFound();
    }

    const reminder = JSON.parse(JSON.stringify(rawReminder));

    return <EditReminderClient reminder={reminder} />;
}