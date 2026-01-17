"use client";

import { useEffect, useMemo, useState } from "react";
import{Bell, BellOff, AlertTriangle } from "lucide-react"

type Reminder = {
  id: string;
  name: string;
  type: string; 
  config: string; 
  isDisabled: boolean;
  hasWarnings: boolean;
  timezone?: string;
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

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseTimeToHM(time?: string): { h: number; m: number } {
  if (!time) return { h: 0, m: 0 };
  const [hh, mm] = time.split(":");
  return { h: Number(hh || 0), m: Number(mm || 0) };


}


type CalendarEvent = {
  id: string;
  title: string;
  time?: string;
  disabled?: boolean;
  warnings?: boolean;
};


export default function CalendarPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // To do: < > Navigation ?? 
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); 

  useEffect(() => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data))
      .finally(() => setLoading(false));
  }, []);

  const eventsByDay = useMemo(() => {
    const map: Record<string, { id: string; title: string; time?: string; disabled?: boolean; warnings?: boolean }[]> = {};

    for (const r of reminders) {
      // nur yearly 
      if (r.type !== "yearly") continue;

      let cfg: any = null;
      try {
        cfg = JSON.parse(r.config);
      } catch {
        continue;
      }

      
      const cfgMonth = String(cfg?.month || "").toLowerCase();
      const cfgDay = Number(cfg?.day);

      if (!(cfgMonth in MONTH_INDEX)) continue;
      if (!cfgDay || cfgDay < 1 || cfgDay > 31) continue;

      const reminderMonthIndex = MONTH_INDEX[cfgMonth];
      // akt. monat anzeigen
      if (reminderMonthIndex !== month) continue;

      const { h, m } = parseTimeToHM(cfg?.time);
      const date = new Date(year, month, cfgDay, h, m);

      const key = dayKey(date);
      if (!map[key]) map[key] = [];

      map[key].push({
        id: r.id,
        title: r.name,
        time: cfg?.time,
        disabled: r.isDisabled,
        warnings: r.hasWarnings,
      });
    }

    // noch nach uhrzeit sortiern 
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    }

    return map;
  }, [reminders, month, year]);

  // Grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Mo=0 - So=6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = firstDay.toLocaleString("en-US", { month: "long" });

  if (loading) return <div className="p-6">Loading…</div>;


  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            {monthLabel} {year} • Loaded reminders: {reminders.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-sm">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
          <div key={d} className="font-medium text-muted-foreground px-1">
            {d}
          </div>
        ))}

        {cells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={idx}
                className="min-h-[96px] rounded border bg-background/60"
              />
            );
          }

          const date = new Date(year, month, day);
          const key = dayKey(date);
          const events = eventsByDay[key] ?? [];

          const visible = events.slice(0, 2);
          const remaining = events.length - visible.length;

          return (
            <div key={idx} className="min-h-[96px] rounded border bg-background p-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{day}</div>

                {events.length > 0 ? (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Bell className="h-3 w-3" />
                    {events.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-2 space-y-1">
                {visible.map((e) => (
                  <div
                    key={e.id}
                    title={e.title}
                    className={`truncate rounded px-2 py-1 text-xs flex items-center gap-1 ${
                      e.disabled
                        ? "bg-muted text-muted-foreground line-through"
                        : "bg-muted"
                    }`}
                  >
                    {e.time ? (
                      <span className="font-mono">{e.time}</span>
                    ) : null}

                    <span className="truncate">{e.title}</span>
                    
                    

                    {e.disabled ? (
                      <BellOff className="h-3 w-3 text-muted-foreground" />
                    ) : null}
                  </div>
                ))}

                {remaining > 0 ? (
                  <div className="text-xs text-muted-foreground">+{remaining} more</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

 
}
