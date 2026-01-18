"use client";
import {
  Card,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Center,
} from "@mantine/core"; 
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { LogoFull } from '@/components/ui/Logo';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await signIn('credentials', {
      emailOrUsername,
      password,
      redirect: false
    });

    if (result?.error) {
      console.error('Sign-in error:', result.error);
      setError("Invalid username, email or password.");
    } else {
      window.location.href = '/';
    }
  };

  return (
    <Center h="100vh">
      <Stack align="center" gap="lg">
        
        <LogoFull size={120} />

        <Card shadow="md" padding="xl" radius="md" w={360} withBorder>
          <Stack gap="md">
            <div>
              <Text size="sm" c="dimmed" ta="center" fw={500}>
                Sign in to your account.
              </Text>
            </div>

            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSignIn}>
              <Stack gap="md">
                <TextInput
                  label="Username or Email"
                  placeholder="Your username or email"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.currentTarget.value)}
                  required
                  autoComplete="username"
                />

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                  autoComplete="current-password"
                />

                <Button type="submit" fullWidth mt="md"> 
                  Sign In 
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Stack>
    </Center>
  );
}