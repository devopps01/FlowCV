import { useState, useCallback } from 'react';
import { Control, useFieldArray, UseFormSetValue } from 'react-hook-form';

/**
 * Custom hook for managing array-based form fields with React Hook Form
 * Provides add, remove, and direct field update operations
 */
export function useArrayField<T extends Record<string, any>>(
  control: Control<any>,
  fieldName: string,
  setValue?: UseFormSetValue<any>
) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: fieldName,
  });

  // Add new item to array
  const addItem = useCallback((item: T) => {
    append(item);
  }, [append]);

  // Remove item at index
  const removeItem = useCallback((index: number) => {
    remove(index);
  }, [remove]);

  // Update entire item at specific index
  const updateItem = useCallback((index: number, updates: Partial<T>) => {
    update(index, updates);
  }, [update]);

  // Set specific field value in item at index - THIS IS THE KEY METHOD
  const setItemField = useCallback((index: number, field: keyof T, value: any) => {
    if (setValue) {
      // For React Hook Form - update the form value directly
      setValue(`${fieldName}.${index}.${String(field)}` as any, value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [setValue, fieldName]);

  return {
    fields,
    addItem,
    removeItem,
    updateItem,
    setItemField,
  };
}

/**
 * Simple array field manager for non-react-hook-form scenarios
 */
export function useSimpleArrayField<T>(
  items: T[],
  onChange: (items: T[]) => void,
  defaultItem?: () => T
) {
  const [localItems, setLocalItems] = useState<T[]>(items);

  // Sync with parent
  if (JSON.stringify(localItems) !== JSON.stringify(items)) {
    setLocalItems(items);
  }

  const addItem = useCallback(() => {
    const newItem = defaultItem ? defaultItem() : ({} as T);
    const newItems = [...items, newItem];
    setLocalItems(newItems);
    onChange(newItems);
  }, [items, onChange, defaultItem]);

  const removeItem = useCallback((index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setLocalItems(newItems);
    onChange(newItems);
  }, [items, onChange]);

  const updateItem = useCallback((index: number, updates: Partial<T>) => {
    const newItems = items.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    );
    setLocalItems(newItems);
    onChange(newItems);
  }, [items, onChange]);

  const setItemField = useCallback((index: number, field: keyof T, value: any) => {
    const newItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setLocalItems(newItems);
    onChange(newItems);
  }, [items, onChange]);

  return {
    items: localItems,
    addItem,
    removeItem,
    updateItem,
    setItemField,
  };
}
