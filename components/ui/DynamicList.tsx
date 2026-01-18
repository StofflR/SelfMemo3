"use client";

import React from 'react';
import { Table, Button, Text, Group, ActionIcon } from '@mantine/core';
import { Trash } from 'lucide-react'; 
import Link from 'next/link';

interface DynamicListProps<T extends { id: string }> {
  data: T[];
  fields: string[];
  entity?: string;
  showEditButton?: boolean;
  showDeleteButton?: boolean; 
  entityButtonText?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void; 
  fieldFormatter?: Record<string, (val: any) => React.ReactNode>;
  labelFormatter?: Record<string, () => string>;
}

export default function DynamicList<T extends { id: string }>({
  data,
  fields,
  entity,
  showEditButton = false,
  showDeleteButton = false, 
  entityButtonText = "Edit",
  onEdit,
  onDelete, 
  fieldFormatter,
  labelFormatter,
}: DynamicListProps<T>) {

  if (!data || data.length === 0) {
    return <Text c="dimmed" fs="italic" size="sm" py="md">No entries found.</Text>;
  }

  const showActions = showEditButton || showDeleteButton;

  return (
    <Table striped highlightOnHover verticalSpacing="xs">
      <Table.Thead>
        <Table.Tr>
          {fields.map((field) => (
            <Table.Th key={field}>
              {labelFormatter && labelFormatter[field] 
                ? labelFormatter[field]() 
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </Table.Th>
          ))}
          {showActions && <Table.Th style={{ width: '150px' }}>Actions</Table.Th>}
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {data.map((item) => (
          <Table.Tr key={item.id}>
            {fields.map((field) => (
              <Table.Td key={`${item.id}-${field}`}>
                {fieldFormatter && fieldFormatter[field]
                  ? fieldFormatter[field]((item as any)[field])
                  : String((item as any)[field] ?? '-')} 
              </Table.Td>
            ))}

            {showActions && (
              <Table.Td>
                <Group gap="xs">
                  {showEditButton && (
                    <Button variant="transparent" size="xs" onClick={() => onEdit?.(item)}>
                      {entityButtonText}
                    </Button>
                  )}

                  {showDeleteButton && (
                    <ActionIcon 
                      variant="subtle" 
                      color="red" 
                      onClick={() => {
                        onDelete?.(item);
                      }}
                    >
                      <Trash size={16} strokeWidth={1.5} />
                    </ActionIcon>
                  )}
                </Group>
              </Table.Td>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}