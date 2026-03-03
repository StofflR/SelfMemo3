"use client";

import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Checkbox,
  Button,
  Group,
  Stack,
  Text,
  Radio,
  Box
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { useRouter, useSearchParams } from "next/navigation";

const tzdata = require('tzdata');

type ReminderFormDataType = {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  config: string;
  isDisabled: boolean;
  hasWarnings: boolean;
  warningNumber: number | null;
  warningInterval: string | null;
  warningIntervalNumber: number | null;
  timezone: string | null;
  emailTemplate: string;
  additionalUserIds: string | null;
};

interface ReminderFormProps {
  reminder?: any;
  onClose?: () => void;
  onSuccess?: () => void;
}

const defaultReminderValues: ReminderFormDataType = {
  id: '',
  userId: '',
  name: '',
  description: '',
  type: '',
  config: '{}',
  isDisabled: false,
  hasWarnings: false,
  warningNumber: 1,
  warningInterval: '',
  warningIntervalNumber: 1,
  timezone: 'Etc/GMT',
  emailTemplate: 'default',
  additionalUserIds: '',
};

export default function ReminderForm({ reminder, onClose, onSuccess }: ReminderFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isUpdate = !!reminder;

  const returnTo = useMemo(() => {
    const rt = searchParams.get("returnTo");
    return rt && rt.startsWith("/") ? rt : null;
  }, [searchParams]);

  const navigateBack = useCallback(() => {
    const target = returnTo ?? "/reminders";
    router.replace(target);
    router.refresh();
  }, [router, returnTo]);

  const [timezones, setTimezones] = useState<Array<{ value: string; label: string }>>([]);
  const [reminderFormData, setReminderFormData] = useState<ReminderFormDataType>(defaultReminderValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDefaultTimezone, setUserDefaultTimezone] = useState<string>('Etc/GMT');
  const [userDefaultEmailTemplate, setUserDefaultEmailTemplate] = useState<string>('default');

  const [oneTimeTimestamp, setOneTimeTimestamp] = useState<Date | null>(new Date());

  const [dailyTime, setDailyTime] = useState<string>('00:00');
  const [days, setDays] = useState({
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true,
  });

  const [weeklyDay, setWeeklyDay] = useState<string>('monday');
  const [weeklyTime, setWeeklyTime] = useState<string>('00:00');

  const [nWeeklyWeeks, setNWeeklyWeeks] = useState<number>(1);
  const [nWeeklyDate, setNWeeklyDate] = useState<Date | null>(new Date());
  const [nWeeklyTime, setNWeeklyTime] = useState<string>('00:00');

  const [monthlyType, setMonthlyType] = useState<string>("monthlyType1");
  const [monthlyTime, setMonthlyTime] = useState<string>("00:00");
  const [monthlyDay, setMonthlyDay] = useState<number>(1);
  const [monthlyOrderNumber, setMonthlyOrderNumber] = useState<string>('first');
  const [monthlyWeekDay, setMonthlyWeekDay] = useState<string>('monday');

  const [yearlyType, setYearlyType] = useState<string>('yearlyType1');
  const [yearlyMonth, setYearlyMonth] = useState<string>('january');
  const [yearlyDay, setYearlyDay] = useState<number>(1);
  const [yearlyOrderNumber, setYearlyOrderNumber] = useState<string>('first');
  const [yearlyWeekDay, setYearlyWeekDay] = useState<string>('monday');
  const [yearlyTime, setYearlyTime] = useState<string>('00:00');
  const [selectedYearlyDate, setSelectedYearlyDate] = useState<Date | null>(new Date());

  const [nYearlyYears, setNYearlyYears] = useState<number>(1);
  const [nYearlyType, setNYearlyType] = useState<string>('yearlyType1');
  const [nYearlyMonth, setNYearlyMonth] = useState<string>('january');
  const [nYearlyDay, setNYearlyDay] = useState<number>(1);
  const [nYearlyOrderNumber, setNYearlyOrderNumber] = useState<string>('first');
  const [nYearlyWeekDay, setNYearlyWeekDay] = useState<string>('monday');
  const [nYearlyTime, setNYearlyTime] = useState<string>('00:00');
  const [selectedNYearlyDate, setSelectedNYearlyDate] = useState<Date | null>(new Date());

  const [hasUntilDate, setHasUntilDate] = useState<boolean>(false);
  const [untilDate, setUntilDate] = useState<Date | null>(new Date());

  /** MULTI-USER PROPS */
  const [isMultiUser, setIsMultiUser] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<Array<{ id: string; username: string; email: string }>>([]);
  const [userSuggestions, setUserSuggestions] = useState<Array<{ id: string; username: string; email: string; firstName: string | null; lastName: string | null }>>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  /** NOTIFY ON SAVE PROPS */
  const [notifyOnSave, setNotifyOnSave] = useState<boolean>(false);

  /** EMAIL TEMPLATES */
  const [emailTemplates, setEmailTemplates] = useState<string[]>([]);

  useEffect(() => {
    if (reminder) {
      setReminderFormData(reminder as ReminderFormDataType);
      const config = JSON.parse(reminder.config);
      const parseDate = (ts: any) => (ts ? new Date(ts * 1000) : new Date());

      switch (reminder.type) {
        case 'one-time':
          setOneTimeTimestamp(parseDate(config.timestamp));
          break;
        case 'daily':
          setDailyTime(config.time || '00:00');
          setDays(config.repeat || days);
          break;
        case 'weekly':
          setWeeklyDay(config.day || 'monday');
          setWeeklyTime(config.time || '00:00');
          break;
        case 'n-weekly':
          setNWeeklyWeeks(config.weeks || 1);
          setNWeeklyDate(parseDate(config.date));
          setNWeeklyTime(config.time || '00:00');
          break;
        case 'monthly':
          setMonthlyType(config.type || 'monthlyType1');
          setMonthlyTime(config.time || '00:00');
          setMonthlyDay(config.day || 1);
          setMonthlyOrderNumber(config.orderNumber || 'first');
          setMonthlyWeekDay(config.weekDay || 'monday');
          break;
        case 'yearly':
          setYearlyType(config.type || 'yearlyType1');
          setYearlyMonth(config.month || 'january');
          setYearlyDay(config.day || 1);
          setYearlyOrderNumber(config.orderNumber || 'first');
          setYearlyWeekDay(config.weekDay || 'monday');
          setYearlyTime(config.time || '00:00');
          if (config.month && config.day) {
            const monthIndex = new Date(`${config.month} 1, 2000`).getMonth();
            const restored = new Date(new Date().getFullYear(), monthIndex, config.day);
            setSelectedYearlyDate(restored);
          } else {
            setSelectedYearlyDate(new Date());
          }
          break;
        case 'n-yearly':
          setNYearlyYears(config.years || 1);
          setNYearlyType(config.type || 'yearlyType1');
          setNYearlyMonth(config.month || 'january');
          setNYearlyDay(config.day || 1);
          setNYearlyOrderNumber(config.orderNumber || 'first');
          setNYearlyWeekDay(config.weekDay || 'monday');
          setNYearlyTime(config.time || '00:00');
          if (config.month && config.day) {
            const monthIndex = new Date(`${config.month} 1, 2000`).getMonth();
            const restored = new Date(new Date().getFullYear(), monthIndex, config.day);
            setSelectedNYearlyDate(restored);
          } else {
            setSelectedNYearlyDate(new Date());
          }
          break;
      }

      if (config.hasUntilDate) {
        setHasUntilDate(true);
        setUntilDate(parseDate(config.untilDate));
      } else {
        setHasUntilDate(false);
      }

      // Load multi-user data if available
      if (reminder.additionalUserIds) {
        try {
          const userIds = JSON.parse(reminder.additionalUserIds);
          if (Array.isArray(userIds) && userIds.length > 0) {
            setIsMultiUser(true);
            // Fetch user details for the selected users
            const fetchUsers = async () => {
              try {
                const users = await Promise.all(
                  userIds.map(async (userId: string) => {
                    try {
                      const response = await axios.get(`/api/users/${userId}`);
                      return {
                        id: response.data.id,
                        username: response.data.username,
                        email: response.data.email,
                      };
                    } catch {
                      return null;
                    }
                  })
                );
                setSelectedUsers(users.filter((u) => u !== null) as Array<{ id: string; username: string; email: string }>);
              } catch (error) {
                console.error('Error fetching user details:', error);
              }
            };
            fetchUsers();
          }
        } catch (error) {
          console.error('Error parsing additionalUserIds:', error);
        }
      }
    } else {
      setReminderFormData(defaultReminderValues);
      setHasUntilDate(false);
      setUntilDate(new Date());
    }
  }, [reminder]);

  // Load timezones and user's default timezone
  useEffect(() => {
    const list = Object.keys(tzdata.zones)
      .filter(name => name.startsWith('Etc/GMT'))
      .filter(name => !['Etc/GMT0', 'Etc/GMT-0', 'Etc/GMT+0'].includes(name))
      .sort()
      .map(name => ({
        value: name,
        label: name.replace('Etc/', '').replace(/_/g, ' ')
      }));
    setTimezones(list);

    // Fetch user's default timezone
    const fetchUserTimezone = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.defaultTimezone) {
            setUserDefaultTimezone(userData.defaultTimezone);
            // Set default timezone for new reminders only
            if (!reminder) {
              setReminderFormData(prev => ({
                ...prev,
                timezone: userData.defaultTimezone,
                emailTemplate: prev.emailTemplate || 'default'
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user timezone:', error);
      }
    };

    fetchUserTimezone();
  }, [reminder]);

  // Load email templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/email-template.json');
        const data = await response.json();
        const templateKeys = Object.keys(data).map(key =>
          key.charAt(0).toUpperCase() + key.slice(1)
        );
        setEmailTemplates(templateKeys);
      } catch (error) {
        console.error('Error loading email templates:', error);
        // Fallback to default templates
        setEmailTemplates(['Default', 'Birthday', 'Meeting', 'Task']);
      }
    };
    loadTemplates();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    setReminderFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    setReminderFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiUserCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMultiUser(e.target.checked);
    if (!e.target.checked) {
      setSelectedUsers([]);
      setUsernameInput('');
      setUserSuggestions([]);
    }
  };

  const handleUsernameInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsernameInput(value);

    if (value.length >= 3) {
      try {
        const response = await axios.get(`/api/users/search?q=${encodeURIComponent(value)}`);
        setUserSuggestions(response.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching user suggestions:', error);
      }
    } else {
      setUserSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectUser = (user: { id: string; username: string; email: string; firstName: string | null; lastName: string | null }) => {
    setSelectedUsers([...selectedUsers, { id: user.id, username: user.username, email: user.email }]);
    setUsernameInput('');
    setUserSuggestions([]);
    setShowSuggestions(false);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleTypeChange = (value: string | null) => {
    if (!value) return;
    setReminderFormData(prev => ({ ...prev, type: value }));

    let newInterval = 'minute';
    if (value === 'one-time') newInterval = 'day';
    if (value === 'daily') newInterval = 'hour';
    if (['weekly', 'n-weekly', 'monthly'].includes(value)) newInterval = 'day';
    if (['yearly', 'n-yearly'].includes(value)) newInterval = 'week';

    setReminderFormData(prev => ({ ...prev, warningInterval: newInterval }));
  };

  const handleYearlyDateChange = (date: Date | null, isNYearly = false) => {
    if (!date) return;
  
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return;

    const monthName = dateObj.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const day = dateObj.getDate();

    if (isNYearly) {
      setSelectedNYearlyDate(dateObj);
      setNYearlyMonth(monthName);
      setNYearlyDay(day);
    } else {
      setSelectedYearlyDate(dateObj);
      setYearlyMonth(monthName);
      setYearlyDay(day);
    }
  };

  const getTimeStringFromDate = (date: Date | null | string | undefined) => {
    if (!date) return '00:00';

    const d = date instanceof Date ? date : new Date(date);

    if (isNaN(d.getTime())) return '00:00';

    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleOneTimeTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.currentTarget.value;
    if (!timeStr) return;

    let baseDate = oneTimeTimestamp instanceof Date
      ? oneTimeTimestamp
      : (oneTimeTimestamp ? new Date(oneTimeTimestamp) : new Date());

    if (isNaN(baseDate.getTime())) baseDate = new Date();

    const [hours, minutes] = timeStr.split(':').map(Number);

    const newDate = new Date(baseDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);

    setOneTimeTimestamp(newDate);
  };

  const createNewConfig = (): any => {
    const type = reminderFormData.type;
    const newConfig: any = {};


    const dateToTs = (d: Date | null | string | undefined) => {
      if (!d) return 0;
      const dateObj = typeof d === 'string' ? new Date(d) : d;
      if (isNaN(dateObj.getTime())) return 0;
      return dateObj.getTime() / 1000;
    };

    switch (type) {
      case 'one-time':
        newConfig.timestamp = dateToTs(oneTimeTimestamp);
        break;
      case 'daily':
        newConfig.time = dailyTime;
        newConfig.repeat = days;
        break;
      case 'weekly':
        newConfig.time = weeklyTime;
        newConfig.day = weeklyDay;
        break;
      case 'n-weekly':
        newConfig.weeks = nWeeklyWeeks;
        newConfig.date = dateToTs(nWeeklyDate);
        newConfig.time = nWeeklyTime;
        break;
      case 'monthly':
        newConfig.type = monthlyType;
        newConfig.time = monthlyTime;
        newConfig.day = monthlyDay;
        newConfig.orderNumber = monthlyOrderNumber;
        newConfig.weekDay = monthlyWeekDay;
        break;
      case 'yearly':
        newConfig.type = yearlyType;
        newConfig.month = yearlyMonth;
        newConfig.day = yearlyDay;
        newConfig.orderNumber = yearlyOrderNumber;
        newConfig.weekDay = yearlyWeekDay;
        newConfig.time = yearlyTime;
        break;
      case 'n-yearly':
        newConfig.years = nYearlyYears;
        newConfig.type = nYearlyType;
        newConfig.month = nYearlyMonth;
        newConfig.day = nYearlyDay;
        newConfig.orderNumber = nYearlyOrderNumber;
        newConfig.weekDay = nYearlyWeekDay;
        newConfig.time = nYearlyTime;
        break;
    }

    newConfig.hasUntilDate = hasUntilDate;
    if (hasUntilDate) {
      newConfig.untilDate = dateToTs(untilDate);
    }

    return newConfig;
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigateBack();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reminderFormData.name || !reminderFormData.type) {
      notifications.show({ message: "Name and Type are required", color: "red" });
      return;
    }

    setIsSubmitting(true);

    try {
      const configObj = createNewConfig();
      const payload = {
        ...reminderFormData,
        config: JSON.stringify(configObj),
        additionalUserIds: isMultiUser && selectedUsers.length > 0 ? JSON.stringify(selectedUsers.map(u => u.id)) : null,
      };

      const baseUrl = isUpdate ? `/api/reminders/${reminderFormData.id}` : '/api/reminders';
      const url = notifyOnSave ? `${baseUrl}?notifyNow=true` : baseUrl;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      notifications.show({
        title: isUpdate ? 'Updated' : 'Created',
        message: 'Reminder saved successfully',
        color: 'green'
      });

      if (onSuccess) {
        onSuccess();
        return;
      }

      navigateBack();
    } catch (error: any) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekdays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const orderNumbers = [
    { value: 'first', label: 'First' }, { value: 'second', label: 'Second' },
    { value: 'third', label: 'Third' }, { value: 'fourth', label: 'Fourth' },
  ];

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <Stack gap="md">

        <TextInput
          label="Name"
          name="name"
          value={reminderFormData.name}
          onChange={handleTextChange}
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={reminderFormData.description}
          onChange={handleTextChange}
          rows={3}
        />

        <Group grow>
          <Select
            label="Timezone"
            data={timezones}
            value={reminderFormData.timezone}
            onChange={(val) => handleSelectChange('timezone', val)}
            searchable
          />

          <Select
            label="Email Template"
            data={emailTemplates}
            value={reminderFormData.emailTemplate ? reminderFormData.emailTemplate.charAt(0).toUpperCase() + reminderFormData.emailTemplate.slice(1) : ''}
            onChange={(val) => handleSelectChange('emailTemplate', val?.toLowerCase() || null)}
          />
        </Group>

        <Select
          label="Type"
          required
          value={reminderFormData.type}
          onChange={handleTypeChange}
          data={[
            { value: 'one-time', label: 'One-time' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'n-weekly', label: 'N-Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
            { value: 'n-yearly', label: 'N-Yearly' },
          ]}
        />

        {/* ONE TIME */}
        {reminderFormData.type === 'one-time' && (
          <Group grow>
            <DatePickerInput
              label="Date"
              value={oneTimeTimestamp}
              onChange={(d) => setOneTimeTimestamp(d as Date | null)}
              valueFormat="DD.MM.YYYY"
              leftSection={<IconCalendar size={18} stroke={1.5} />}
              placeholder="Pick date"
            />
            <TimeInput
              label="Time"
              value={getTimeStringFromDate(oneTimeTimestamp)}
              onChange={handleOneTimeTimeChange}
              leftSection={<IconClock size={16} />}
            />
          </Group>
        )}

        {/* DAILY */}
        {reminderFormData.type === "daily" && (
          <Stack>
            <TimeInput
              label="Time"
              value={dailyTime}
              onChange={(e) => setDailyTime(e.currentTarget.value)}
              leftSection={<IconClock size={16} />}
            />
            <Text size="sm" fw={500}>
              Repeat on:
            </Text>
            <Group gap="xs">
              {Object.keys(days).map((day) => (
                <Checkbox
                  key={day}
                  label={day.substring(0, 3).toUpperCase()}
                  checked={(days as any)[day]}
                  onChange={(e) => {
                    const isChecked = e.currentTarget.checked;
                    setDays((p) => ({ ...p, [day]: isChecked }));
                  }}
                />
              ))}
            </Group>
          </Stack>
        )}

        {reminderFormData.type === 'weekly' && (
          <Group grow>
            <Select label="Day" data={weekdays} value={weeklyDay} onChange={(v) => setWeeklyDay(v || 'monday')} />
            <TimeInput label="Time" value={weeklyTime} onChange={(e) => setWeeklyTime(e.currentTarget.value)} leftSection={<IconClock size={16} />} />
          </Group>
        )}

        {/* N-WEEKLY */}
        {reminderFormData.type === 'n-weekly' && (
          <Stack>
            <Group grow>
              <NumberInput label="Every (weeks)" value={nWeeklyWeeks} onChange={(v) => setNWeeklyWeeks(Number(v))} min={1} />
              <DatePickerInput
                label="Starting From"
                value={nWeeklyDate}
                onChange={(d) => setNWeeklyDate(d as Date | null)}
                leftSection={<IconCalendar size={18} stroke={1.5} />}
                valueFormat="DD.MM.YYYY"
              />
            </Group>
            <TimeInput label="Time" value={nWeeklyTime} onChange={(e) => setNWeeklyTime(e.currentTarget.value)} leftSection={<IconClock size={16} />} />
          </Stack>
        )}

        {reminderFormData.type === 'monthly' && (
          <Stack>
            <TimeInput label="Time" value={monthlyTime} onChange={(e) => setMonthlyTime(e.currentTarget.value)} leftSection={<IconClock size={16} />} />
            <Radio.Group value={monthlyType} onChange={setMonthlyType} label="Pattern">
              <Stack mt="xs">
                <Radio value="monthlyType1" label={
                  <Group gap="xs">
                    <Text size="sm">Day</Text>
                    <NumberInput size="xs" w={60} value={monthlyDay} onChange={(v) => setMonthlyDay(Number(v))} min={1} max={31} />
                    <Text size="sm">of every month</Text>
                  </Group>
                } />
                <Radio value="monthlyType2" label={
                  <Group gap="xs">
                    <Text size="sm">The</Text>
                    <Select size="xs" w={110} data={orderNumbers} value={monthlyOrderNumber} onChange={(v) => setMonthlyOrderNumber(v!)} />
                    <Select size="xs" w={130} data={weekdays} value={monthlyWeekDay} onChange={(v) => setMonthlyWeekDay(v!)} />
                  </Group>
                } />
              </Stack>
            </Radio.Group>
          </Stack>
        )}

        {/* YEARLY */}
        {reminderFormData.type === 'yearly' && (
          <Stack>
            <TimeInput label="Time" value={yearlyTime} onChange={(e) => setYearlyTime(e.currentTarget.value)} leftSection={<IconClock size={16} />} />
            <Radio.Group value={yearlyType} onChange={setYearlyType} label="Pattern">
              <Stack mt="xs">
                <Radio value="yearlyType1" label={
                  <Group gap="xs">
                    <Text size="sm">On</Text>
                    <DatePickerInput
                      placeholder="Pick date"
                      value={selectedYearlyDate}
                      onChange={(d) => handleYearlyDateChange(d as Date | null, false)}
                      valueFormat="D. MMMM"
                      w={180}
                      size="xs"
                      popoverProps={{ withinPortal: true }}
                    />
                  </Group>
                } />
                <Radio value="yearlyType2" label={
                  <Group gap="xs">
                    <Text size="sm">The</Text>
                    <Select size="xs" w={100} data={orderNumbers} value={yearlyOrderNumber} onChange={(v) => setYearlyOrderNumber(v!)} />
                    <Select size="xs" w={110} data={weekdays} value={yearlyWeekDay} onChange={(v) => setYearlyWeekDay(v!)} />
                    <Text size="sm">of</Text>
                    <Select size="xs" w={110} data={[
                      { value: 'january', label: 'January' }, { value: 'february', label: 'February' }, { value: 'march', label: 'March' },
                      { value: 'april', label: 'April' }, { value: 'may', label: 'May' }, { value: 'june', label: 'June' },
                      { value: 'july', label: 'July' }, { value: 'august', label: 'August' }, { value: 'september', label: 'September' },
                      { value: 'october', label: 'October' }, { value: 'november', label: 'November' }, { value: 'december', label: 'December' }
                    ]} value={yearlyMonth} onChange={(v) => setYearlyMonth(v!)} />
                  </Group>
                } />
              </Stack>
            </Radio.Group>
          </Stack>
        )}

        {/* N-YEARLY */}
        {reminderFormData.type === 'n-yearly' && (
          <Stack>
            <Group>
              <Text size="sm">Every</Text>
              <NumberInput w={70} value={nYearlyYears} onChange={(v) => setNYearlyYears(Number(v))} min={1} />
              <Text size="sm">year(s)</Text>
            </Group>
            <TimeInput label="Time" value={nYearlyTime} onChange={(e) => setNYearlyTime(e.currentTarget.value)} leftSection={<IconClock size={16} />} />

            <Radio.Group value={nYearlyType} onChange={setNYearlyType} label="Pattern">
              <Stack mt="xs">
                <Radio value="yearlyType1" label={
                  <Group gap="xs">
                    <Text size="sm">On</Text>
                    <DatePickerInput
                      placeholder="Pick date"
                      value={selectedNYearlyDate}
                      onChange={(d) => handleYearlyDateChange(d as Date | null, true)}
                      valueFormat="D. MMMM"
                      w={180}
                      size="xs"
                      popoverProps={{ withinPortal: true }}
                    />
                  </Group>
                } />
                <Radio value="yearlyType2" label={
                  <Group gap="xs">
                    <Text size="sm">The</Text>
                    <Select size="xs" w={100} data={orderNumbers} value={nYearlyOrderNumber} onChange={(v) => setNYearlyOrderNumber(v!)} />
                    <Select size="xs" w={110} data={weekdays} value={nYearlyWeekDay} onChange={(v) => setNYearlyWeekDay(v!)} />
                    <Text size="sm">of</Text>
                    <Select size="xs" w={110} data={[
                      { value: 'january', label: 'January' }, { value: 'february', label: 'February' }, { value: 'march', label: 'March' },
                      { value: 'april', label: 'April' }, { value: 'may', label: 'May' }, { value: 'june', label: 'June' },
                      { value: 'july', label: 'July' }, { value: 'august', label: 'August' }, { value: 'september', label: 'September' },
                      { value: 'october', label: 'October' }, { value: 'november', label: 'November' }, { value: 'december', label: 'December' }
                    ]} value={nYearlyMonth} onChange={(v) => setNYearlyMonth(v!)} />
                  </Group>
                } />
              </Stack>
            </Radio.Group>
          </Stack>
        )}

        {/* UNTIL DATE */}
        {reminderFormData.type && reminderFormData.type !== 'one-time' && (
          <Box mt="md">
            <Checkbox
              label="End repeat on specific date"
              checked={hasUntilDate}
              onChange={(e) => setHasUntilDate(e.currentTarget.checked)}
            />
            {hasUntilDate && (
              <DatePickerInput
                mt="xs"
                label="Until Date"
                value={untilDate}
                onChange={(d) => setUntilDate(d as Date | null)}
                leftSection={<IconCalendar size={18} stroke={1.5} />}
                valueFormat="DD.MM.YYYY"
              />
            )}
          </Box>
        )}

        {/* Notify on Save */}
        <Box>
          <Checkbox
            label={isUpdate ? 'Send notification immediately after update' : 'Send notification immediately after creation'}
            checked={notifyOnSave}
            onChange={(e) => setNotifyOnSave(e.currentTarget.checked)}
          />
        </Box>

        {/* Multi-User Support */}
        <Box>
          <Checkbox
            label="Send to multiple users"
            checked={isMultiUser}
            onChange={handleMultiUserCheckboxChange}
          />
          {isMultiUser && (
            <Stack mt="md" gap="sm">
              <div>
                <Text size="sm" fw={500} mb="xs">Add Users</Text>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={handleUsernameInputChange}
                    onFocus={() => usernameInput.length >= 3 && setShowSuggestions(true)}
                    placeholder="Type username (min 3 characters)"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  {showSuggestions && userSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      zIndex: 10,
                      width: '100%',
                      marginTop: '4px',
                      backgroundColor: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      maxHeight: '192px',
                      overflowY: 'auto'
                    }}>
                      {userSuggestions.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #dee2e6'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div style={{ fontWeight: 500 }}>{user.username}</div>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName} (${user.email})`
                              : user.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {selectedUsers.length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="xs">Selected Users:</Text>
                  <Group gap="xs">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: '#e7f5ff',
                          color: '#1971c2',
                          padding: '4px 12px',
                          borderRadius: '16px'
                        }}
                      >
                        <span style={{ marginRight: '8px' }}>{user.username}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(user.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#1971c2',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            lineHeight: 1,
                            padding: 0
                          }}
                        >
                          &#x00d7;
                        </button>
                      </div>
                    ))}
                  </Group>
                </div>
              )}
            </Stack>
          )}
        </Box>

        <Box>
          <Checkbox
            label="Enable Warning Reminders"
            checked={reminderFormData.hasWarnings}
            onChange={(e) => {
              const isChecked = e.currentTarget.checked;
              setReminderFormData(p => ({ ...p, hasWarnings: isChecked }));
            }}
          />

          {reminderFormData.hasWarnings && (
            <Group mt="xs" align="flex-end">
              <NumberInput
                label="Count"
                w={70}
                value={reminderFormData.warningNumber ?? 1}
                onChange={(v) => setReminderFormData(p => ({ ...p, warningNumber: Number(v) }))}
                min={1}
              />
              <Text pb={8}>reminders,</Text>
              <NumberInput
                label="Interval"
                w={70}
                value={reminderFormData.warningIntervalNumber ?? 1}
                onChange={(v) => setReminderFormData(p => ({ ...p, warningIntervalNumber: Number(v) }))}
                min={1}
              />
              <Select
                label="Unit"
                w={100}
                value={reminderFormData.warningInterval}
                onChange={(v) => handleSelectChange('warningInterval', v)}
                data={['minute', 'hour', 'day', 'week', 'month']}
              />
              <Text pb={8}>apart.</Text>
            </Group>
          )}
        </Box>

        <Checkbox
          label="Set Active"
          checked={!reminderFormData.isDisabled}
          onChange={(e) => {
            const isChecked = e.currentTarget.checked;
            setReminderFormData(p => ({ ...p, isDisabled: !isChecked }));
          }}
          mt="sm"
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button type="submit" loading={isSubmitting}>
            {isUpdate ? "Update Reminder" : "Create Reminder"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
