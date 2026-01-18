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
      setError(result.error);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <Center h="100vh">
      <Card shadow="md" padding="lg" radius="md" w={360}>
        <Stack gap="md">
          <div>
            <Text size="xl" fw={600}>
              Login
            </Text>
            <Text size="sm" c="dimmed">
              Please sign in with your username or email and password.
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
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.currentTarget.value)}
                required
              />

              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />

              <Button type="submit" fullWidth> Sign In </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Center>
  );
}
