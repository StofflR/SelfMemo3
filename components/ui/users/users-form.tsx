"use client";

import { useEffect, useState } from 'react';
import { 
  TextInput, 
  PasswordInput, 
  Select, 
  Button, 
  Group, 
  Stack, 
  Text 
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { User } from '@prisma/client';


const OptionalLabel = ({ text }: { text: string }) => (
  <Group gap={4} component="span"> 
    <span>{text}</span>
    <Text span c="dimmed" size="xs" fw="normal" style={{ lineHeight: 1 }}>
      (optional)
    </Text>
  </Group>
);

interface UserFormProps {
  user?: User | null; 
  onClose?: () => void; 
  onSuccess?: () => void; 
}

export default function UserForm({ user, onClose, onSuccess }: UserFormProps) {
  const isEditMode = !!user;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string | null>("admin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setRole(user.role);
      setPassword(""); 
    } else {
      resetForm();
    }
  }, [user]);

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setRole("admin");
    setPassword("");
  };

  const isFormValid = () => {
    if (!role) return false;
    
    if (!isEditMode && (!password || password.length < 6)) return false;
    if (isEditMode && password.length > 0 && password.length < 6) return false;

    if (role === 'admin') {
      if (!username || username.length < 3) return false;
    } 
    
    if (role === 'user') {
      const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!email || !emailRegex.test(email)) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    setLoading(true);

    try {
      const payload = {
        username: username || undefined,
        email: email || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role: role,
        ...(password ? { password } : {}), 
      };

      const url = isEditMode ? `/api/users/${user.id}` : "/api/users";
      const method = isEditMode ? "PUT" : "POST"; 

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (errorData.errors && errorData.errors[0]?.message) || "Action failed");
      }

      notifications.show({
        title: isEditMode ? 'User updated!' : 'User created!',
        message: isEditMode ? 'User details have been updated.' : 'New user successfully created.',
        color: 'green',
      });

      if (onSuccess) onSuccess(); 
      if (onClose) onClose();
      
      if (!isEditMode) resetForm();

    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
        autoClose: 10000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form autoComplete="off">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {isEditMode 
            ? "Edit the user details below." 
            : "Fill in the required information. Optional fields are marked."}
        </Text>

        <div style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden' }} aria-hidden="true">
          <input type="text" tabIndex={-1} autoComplete="off" readOnly />
          <input type="password" tabIndex={-1} autoComplete="off" readOnly />
        </div>

        <Select
          label="Role"
          data={['admin', 'user']}
          value={role}
          onChange={(val) => setRole(val || 'admin')}
          allowDeselect={false} 
        />

        <TextInput
          label={!isEditMode ? <OptionalLabel text="First Name" /> : "First Name"}
          placeholder="Enter First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.currentTarget.value)}
          autoComplete="off"
          name="new_firstname"
        />

        <TextInput
          label={!isEditMode ? <OptionalLabel text="Last Name" /> : "Last Name"}
          placeholder="Enter Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.currentTarget.value)}
          autoComplete="off"
          name="new_lastname"
        />

        <TextInput
          label={(!isEditMode && role === 'user') ? <OptionalLabel text="Username" /> : "Username"}
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          error={role === 'admin' && username.length > 0 && username.length < 3 ? "Min 3 chars" : null}
          autoComplete="off"
          name="new_username_field"
          data-lpignore="true" 
        />

        <TextInput
          label={(!isEditMode && role === 'admin') ? <OptionalLabel text="E-Mail" /> : "E-Mail"}
          placeholder="Enter E-Mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          error={role === 'user' && email.length > 0 && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) ? "Invalid Email" : null}
          autoComplete="off"
          name="new_email_field"
          data-lpignore="true"
        />

        <PasswordInput
          label={isEditMode ? "Password" : "Password"}
          placeholder="Enter Password"
          description={isEditMode ? "Leave empty to keep current password" : null}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          error={password.length > 0 && password.length < 6 ? "Min 6 chars" : null}
          autoComplete="new-password"
          name="new_password_field"
        />
        
        <Group justify="flex-end" mt="md">
          {onClose && (
            <Button variant="default" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!isFormValid() || loading} loading={loading}>
            {isEditMode ? "Save Changes" : "Create User"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}