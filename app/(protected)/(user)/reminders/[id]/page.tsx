import { redirect } from 'next/navigation';

type Params = Promise<{ id: string }>;

export default async function ReminderDetailPage({params,searchParams,}: {
  params: Params;
  searchParams?: Record<string, string | string[] | undefined>;}) 
  {
  const { id } = await params;

  const sp = new URLSearchParams();

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === "string") sp.set(key, value);
      else if (Array.isArray(value)) value.forEach((v) => sp.append(key, v));
    }
  }

  const qs = sp.toString();
  redirect(`/reminders/${id}/edit${qs ? `?${qs}` : ""}`);
}
