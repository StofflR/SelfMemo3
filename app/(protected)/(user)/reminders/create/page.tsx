"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Paper, Title } from "@mantine/core";
import ReminderForm from "@/components/ui/reminders/reminder-form";

export default function CreateReminderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = useMemo(() => {
    const rt = searchParams.get("returnTo");
    return rt && rt.startsWith("/") ? rt : null;
  }, [searchParams]);

  const goBack = () => {
    router.replace(returnTo ?? "/reminders");
    router.refresh();
  };

  return (
    <Box p="xl" maw={1200}>
      <Title order={2} mb="lg">
        Create Reminder
      </Title>

      <Paper withBorder shadow="sm" radius="md" p="md">
        <ReminderForm onSuccess={goBack} onClose={goBack} />
      </Paper>
    </Box>
  );
}
