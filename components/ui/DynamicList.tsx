"use client";

import React from 'react';
import { Table, Button, Text } from '@mantine/core';
import Link from 'next/link';

interface DynamicListProps<T extends { id: string }> {
  data: T[];
  
  fields: string[];

  entity?: string;

  showEditButton?: boolean;
  entityButtonText?: string;


  onEdit?: (item: T) => void;

  fieldFormatter?: Record<string, (val: any) => React.ReactNode>;

  labelFormatter?: Record<string, () => string>;

  mutateKey?: string;
  filters?: boolean;
  combineFieldsCallbacks?: Record<string, any>;
}

export default function DynamicList<T extends { id: string }>({
  data,
  fields,
  entity,
  showEditButton = false,
  entityButtonText = "Edit",
  onEdit,
  fieldFormatter,
  labelFormatter,
}: DynamicListProps<T>) {

  if (!data || data.length === 0) {
    return (
      <Text c="dimmed" fs="italic" size="sm" py="md">
        No entries found.
      </Text>
    );
  }

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
          {showEditButton && <Table.Th style={{ width: '100px' }}>Actions</Table.Th>}
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

            {showEditButton && (
              <Table.Td>
                {onEdit ? (
                  <Button 
                    variant="transparent" 
                    size="xs" 
                    onClick={() => onEdit(item)}
                  >
                    {entityButtonText}
                  </Button>
                ) : (
                  <Button 
                    component={Link}
                    href={entity ? `/${entity}/${item.id}/edit` : '#'}
                    variant="transparent" 
                    size="xs"
                  >
                    {entityButtonText}
                  </Button>
                )}
              </Table.Td>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}