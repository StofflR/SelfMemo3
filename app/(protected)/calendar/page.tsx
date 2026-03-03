'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Badge,
  ScrollArea,
  Divider,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconBell,
  IconAlertTriangle,
  IconCalendar,
  IconPlus,
  IconPencil,
} from '@tabler/icons-react';

type Reminder = {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  config: string;
  isDisabled: boolean;
  hasWarnings: boolean;
  timezone: string | null;
};

type CalendarEvent = {
  id: string;
  title: string;
  time?: string;
  disabled?: boolean;
  warnings?: boolean;
  reminderId: string;
};

const MONTH_INDEX: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const ORDER_INDEX: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
};

function safeJsonParse(str: string): any | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function parseTime(time?: string): { h: number; m: number } {
  if (!time) return { h: 0, m: 0 };
  const [hh, mm] = time.split(':');
  return { h: Number(hh || 0), m: Number(mm || 0) };
}

function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1, 0, 0, 0);
}
function endOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0, 23, 59, 59);
}

function isWithin(date: Date, min: Date, max: Date) {
  return date.getTime() >= min.getTime() && date.getTime() <= max.getTime();
}

function unixSecondsToDate(sec: number) {
  return new Date(sec * 1000);
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date | null {
  if (nth < 1 || nth > 4) return null;
  let count = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    if (d.getDay() === weekday) {
      count++;
      if (count === nth) return d;
    }
  }
  return null;
}

function shouldStopAtUntilDate(cfg: any, date: Date) {
  if (!cfg?.hasUntilDate) return false;
  const until = unixSecondsToDate(Number(cfg.untilDate));
  return date.getTime() > until.getTime();
}

function monthIndexFromName(name: string): number | null {
  const idx = MONTH_INDEX[String(name || '').toLowerCase()];
  return typeof idx === 'number' ? idx : null;
}

function occurrencesForMonth(reminder: Reminder, year: number, month: number): Date[] {
  const cfg = safeJsonParse(reminder.config);
  if (!cfg) return [];

  const monthStart = startOfMonth(year, month);
  const monthEnd = endOfMonth(year, month);
  const { h, m } = parseTime(cfg.time);
  const out: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  switch (reminder.type) {
    case 'one-time': {
      const ts = Number(cfg.timestamp);
      if (!ts) return [];
      const d = unixSecondsToDate(ts);
      if (isWithin(d, monthStart, monthEnd)) out.push(d);
      return out;
    }

    case 'daily': {
      const repeat = cfg.repeat || {};
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day, h, m);
        const weekdayName = Object.keys(WEEKDAY_INDEX).find((k) => WEEKDAY_INDEX[k] === d.getDay());
        if (!weekdayName) continue;
        if (repeat[weekdayName] === true) {
          if (shouldStopAtUntilDate(cfg, d)) break;
          out.push(d);
        }
      }
      return out;
    }

    case 'weekly': {
      const weekday = WEEKDAY_INDEX[String(cfg.day || '').toLowerCase()];
      if (weekday === undefined) return [];
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day, h, m);
        if (d.getDay() === weekday) {
          if (shouldStopAtUntilDate(cfg, d)) break;
          out.push(d);
        }
      }
      return out;
    }

    case 'n-weekly': {
      const intervalWeeks = Number(cfg.weeks);
      const startSec = Number(cfg.date);
      if (!intervalWeeks || !startSec) return [];
      const startDate = unixSecondsToDate(startSec);
      const targetWeekday = startDate.getDay();

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day, h, m);
        if (d.getDay() !== targetWeekday) continue;

        const diffMs = d.getTime() - startDate.getTime();
        if (diffMs < 0) continue;
        const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        if (diffWeeks % intervalWeeks === 0) {
          if (shouldStopAtUntilDate(cfg, d)) break;
          out.push(d);
        }
      }
      return out;
    }

    case 'monthly': {
      if (cfg.type === 'monthlyType1') {
        const dayNum = Number(cfg.day);
        if (!dayNum) return [];
        const actualDay = Math.min(Math.max(dayNum, 1), daysInMonth);
        const d = new Date(year, month, actualDay, h, m);
        if (!shouldStopAtUntilDate(cfg, d)) out.push(d);
        return out;
      }

      if (cfg.type === 'monthlyType2') {
        const nth = ORDER_INDEX[String(cfg.orderNumber || '').toLowerCase()];
        const weekday = WEEKDAY_INDEX[String(cfg.weekDay || '').toLowerCase()];
        if (!nth || weekday === undefined) return [];
        const base = nthWeekdayOfMonth(year, month, weekday, nth);
        if (!base) return [];
        const d = new Date(year, month, base.getDate(), h, m);
        if (!shouldStopAtUntilDate(cfg, d)) out.push(d);
        return out;
      }
      return [];
    }

    case 'yearly': {
      const targetMonth = monthIndexFromName(cfg.month);
      if (targetMonth === null || targetMonth !== month) return [];

      if (cfg.type === 'yearlyType1') {
        const dayNum = Number(cfg.day);
        if (!dayNum) return [];
        const actualDay = Math.min(Math.max(dayNum, 1), daysInMonth);
        const d = new Date(year, month, actualDay, h, m);
        if (!shouldStopAtUntilDate(cfg, d)) out.push(d);
        return out;
      }

      if (cfg.type === 'yearlyType2') {
        const nth = ORDER_INDEX[String(cfg.orderNumber || '').toLowerCase()];
        const weekday = WEEKDAY_INDEX[String(cfg.weekDay || '').toLowerCase()];
        if (!nth || weekday === undefined) return [];
        const base = nthWeekdayOfMonth(year, month, weekday, nth);
        if (!base) return [];
        const d = new Date(year, month, base.getDate(), h, m);
        if (!shouldStopAtUntilDate(cfg, d)) out.push(d);
        return out;
      }

      return [];
    }

    case 'n-yearly': {
      const intervalYears = Number(cfg.years);
      if (!intervalYears || intervalYears < 1) return [];

      const anchorYear = Number(cfg.startYear ?? year);
      if (((year - anchorYear) % intervalYears) !== 0) return [];

      const targetMonth = monthIndexFromName(cfg.month);
      if (targetMonth === null || targetMonth !== month) return [];

      if (cfg.type === 'yearlyType1') {
        const dayNum = Number(cfg.day);
        if (!dayNum) return [];
        const actualDay = Math.min(Math.max(dayNum, 1), daysInMonth);
        const d = new Date(year, month, actualDay, h, m);
        if (!shouldStopAtUntilDate(cfg, d)) out.push(d);
        return out;
      }

      if (cfg.type === 'yearlyType2') {
        const nth = ORDER_INDEX[String(cfg.orderNumber || '').toLowerCase()];
        const weekday = WEEKDAY_INDEX[String(cfg.weekDay || '').toLowerCase()];
        if (!nth || weekday === undefined) return [];
        const base = nthWeekdayOfMonth(year, month, weekday, nth);
        if (!base) return [];
        const d = new Date(year, month, base.getDate(), h, m);
        if (!shouldStopAtUntilDate(cfg, d)) out.push(d);
        return out;
      }

      return [];
    }

    default:
      return [];
  }
}

function formatSelectedDayLabel(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CalendarPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const [opened, setOpened] = useState(false);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/reminders')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setReminders(data);
        setError(null);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load reminders');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};

    for (const r of reminders) {
      const dates = occurrencesForMonth(r, year, month);
      const cfg = safeJsonParse(r.config);
      const time = cfg?.time;

      for (const d of dates) {
        const key = dayKey(d);
        
        const time = 
          typeof cfg?.time === 'string' && cfg.time.length > 0
          ? cfg.time 
          : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          
        if (!map[key]) map[key] = [];
        map[key].push({
          id: `${r.id}-${d.getTime()}`,
          title: r.name,
          time,
          disabled: r.isDisabled,
          warnings: r.hasWarnings,
          reminderId: r.id,
        });
      }
    }

    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }

    return map;
  }, [reminders, year, month]);

  const monthLabel = useMemo(() => {
    return viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [viewDate]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0

  const cells: Array<{ date: Date | null; key: string }> = [];
  for (let i = 0; i < firstDayIndex; i++) cells.push({ date: null, key: `empty-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ date, key: dayKey(date) });
  }

  const selectedEvents = selectedDayKey ? eventsByDay[selectedDayKey] || [] : [];

  const createHref = useMemo(() => {
    const returnTo = encodeURIComponent('/calendar');
    if (!selectedDayKey) return `/reminders/create?returnTo=${returnTo}`;
    return `/reminders/create?date=${encodeURIComponent(selectedDayKey)}&time=00:00&returnTo=${returnTo}`;
  }, [selectedDayKey]);

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={2}>Calendar</Title>

        <Group>
          <Button
            variant="light"
            leftSection={<IconChevronLeft size={16} />}
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
          >
            Prev
          </Button>

          <Text fw={600}>{monthLabel}</Text>

          <Button
            variant="light"
            rightSection={<IconChevronRight size={16} />}
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
          >
            Next
          </Button>

          <Button
            variant="default"
            leftSection={<IconCalendar size={16} />}
            onClick={() => setViewDate(new Date())}
          >
            Today
          </Button>
        </Group>
      </Group>

      {loading ? <Text>Loading reminders...</Text> : null}
      {error ? <Text c="red">{error}</Text> : null}

      <SimpleGrid cols={7} spacing="sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
          <Text key={w} ta="center" fw={600} c="dimmed">
            {w}
          </Text>
        ))}

        {cells.map(({ date, key }) => {
          if (!date) return <Box key={key} mih={110} />;

          const k = dayKey(date);
          const events = eventsByDay[k] || [];
          const visible = events.slice(0, 3);
          const remaining = Math.max(0, events.length - visible.length);

          const isToday = dayKey(new Date()) === k;

          return (
            <Paper
              key={key}
              withBorder
              p="xs"
              mih={110}
              radius="md"
              /*{style={{ cursor: 'pointer' }}}*/
              style={{ cursor: 'pointer', borderWidth:4 }}
              onClick={() => {
                setSelectedDayKey(k);
                setOpened(true);
              }}
              bg={isToday ? 'var(--mantine-color-blue-light)' : undefined}
            >
              <Group justify="space-between" align="center" gap="xs">
                <Text fw={600}>{date.getDate()}</Text>

                {events.length > 0 ? (
                  <Badge size="xs" variant="light" leftSection={<IconBell size={12} />}>
                    {events.length}
                  </Badge>
                ) : null}
              </Group>

              <Stack gap={6} mt="xs">
                {visible.map((e) => (
                  <Paper key={e.id} p={6} radius="sm" withBorder>
                    <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
                      <Text size="xs" truncate title={e.title}>
                        {e.time ? `${e.time} ` : ''}
                        {e.title}
                      </Text>

                      <Group gap={6}>
                        {e.disabled ? (
                          <Badge size="xs" color="gray" variant="light">
                            disabled
                          </Badge>
                        ) : (
                          <Badge size="xs" color="green" variant="light">
                            active
                          </Badge>
                        )}

                        {e.warnings ? <IconAlertTriangle size={14} /> : null}
                      </Group>
                    </Group>
                  </Paper>
                ))}

                {remaining > 0 ? (
                  <Text size="xs" c="dimmed">
                    +{remaining} more
                  </Text>
                ) : null}
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Reminders" size="md">
        {selectedDayKey ? (
          <Stack>
            <Text c="dimmed" size="sm">
              {formatSelectedDayLabel(selectedDayKey)}
            </Text>

            <Group justify="space-between" align="center">
              <Text size="sm">
                {selectedEvents.length === 0
                  ? 'No reminders on this day'
                  : `${selectedEvents.length} reminder(s) on this day`}
              </Text>

              <Button component={Link} href={createHref} leftSection={<IconPlus size={16} />}>
                Create reminder
              </Button>
            </Group>

            <Divider />

            {selectedEvents.length === 0 ? (
              <Text>No reminders on this day.</Text>
            ) : (
              <ScrollArea h={300}>
                <Stack>
                  {selectedEvents.map((e) => (
                    <Paper key={e.id} withBorder p="sm" radius="md">
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={2}>
                          <Text fw={600}>
                            {e.time ? `${e.time} ` : ''}
                            {e.title}
                          </Text>
                          <Group gap="xs">
                            {e.disabled ? (
                              <Badge color="gray" variant="light">
                                disabled
                              </Badge>
                            ) : (
                              <Badge color="green" variant="light">
                                active
                              </Badge>
                            )}

                            {e.warnings ? (
                              <Badge color="yellow" variant="light">
                                warnings
                              </Badge>
                            ) : null}
                          </Group>
                        </Stack>
                        <Button
                          component={Link}
                          href={`/reminders/${e.reminderId}/edit?returnTo=${encodeURIComponent('/calendar')}`}
                          variant="light"
                          size="xs"
                          leftSection={<IconPencil size={16} />}
                        >
                          Edit
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </ScrollArea>
            )}
          </Stack>
        ) : null}
      </Modal>
    </Stack>
  );
}
