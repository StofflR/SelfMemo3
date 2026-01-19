"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Paper, Title } from "@mantine/core";
import ReminderForm from "@/components/ui/reminders/reminder-form";
import { Reminder } from "@prisma/client";

interface EditReminderFormProps {
  reminder: Reminder;
}

export default function EditReminderForm({ reminder }: EditReminderFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = useMemo(() => {
    const rt = searchParams.get("returnTo");
    return rt && rt.startsWith("/") ? rt : null;
  }, [searchParams]);

  const goBack = () => {
    const target = returnTo ?? "/reminders";
    router.replace(target);
    router.refresh();
  };

  return (
    <Box p="xl" maw={1200}>
      <Title order={2} mb="lg">
        Edit Reminder
      </Title>

      <Paper withBorder shadow="sm" radius="md" p="md">
        <ReminderForm reminder={reminder} onSuccess={goBack} onClose={goBack} />
      </Paper>
    </Box>
  );
}
