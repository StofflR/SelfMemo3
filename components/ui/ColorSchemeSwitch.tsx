// components/ui/ColorSchemeToggle.tsx
"use client";

import { Switch, useMantineColorScheme, useComputedColorScheme, rem } from '@mantine/core';
import { Sun, Moon } from 'lucide-react';

export function ColorSchemeSwitch() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  return (
    <Switch
      size="lg"
      color="dark.4"
      onLabel={<Sun size={16} color="yellow" />}
      offLabel={<Moon size={16} color="black" />}

      checked={computedColorScheme === 'dark'} 
      onChange={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
    />
  );
}