import { redirect } from 'next/navigation';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ReminderDetailPage({params,searchParams,}: {
  params: Params;
  searchParams?: SearchParams;}) 
  {
  const { id } = await params;
  const search = await searchParams;

  const sp = new URLSearchParams();

  if (search) {
    for (const [key, value] of Object.entries(search)) {
      if (typeof value === "string") sp.set(key, value);
      else if (Array.isArray(value)) value.forEach((v) => sp.append(key, v));
    }
  }

  const qs = sp.toString();
  redirect(`/reminders/${id}/edit${qs ? `?${qs}` : ""}`);
}
