'use client';

import { useToast } from '../../../hooks/useToast';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { Button } from '@mantine/core';

export function ExportImportButtons() {
  const toast = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    try {
      const response = await fetch('/api/reminders/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reminders-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export successful', 'Reminders exported as JSON');
    } catch (error) {
      toast.error('Export failed', 'Could not export reminders');
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const reminders = JSON.parse(text);

      const response = await fetch('/api/reminders/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminders)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Import successful', `Imported ${result.count} reminders`);
        router.refresh();
      } else {
        throw new Error('Import failed');
      }
    }
    catch (e) {
      toast.error('Import failed', 'Could not import reminders');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return (
    <>
      <Button onClick={handleExportJSON} variant="default">
        Export JSON
      </Button>
      <Button onClick={() => fileInputRef.current?.click()} variant="default">
        Import JSON
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJSON}
        style={{ display: 'none' }}
      />
    </>
  );
}
