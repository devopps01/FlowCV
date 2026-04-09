import { useState, useCallback, useEffect } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit?: (values: T) => Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  // Update values when initialValues change
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  // Get field value by path (supports nested paths like 'experience[0].company')
  const getFieldValue = useCallback((path: string): any => {
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let value: any = values;
    for (const key of keys) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }
    return value;
  }, [values]);

  // Set field value by path
  const setFieldValue = useCallback((path: string, value: any) => {
    setIsDirty(true);
    setValues(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
          current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
        }
        current = current[key];
      }
      
      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;
      return newData;
    });
  }, []);

  // Handle input change
  const handleChange = useCallback((path: string, value: any) => {
    setFieldValue(path, value);
  }, [setFieldValue]);

  // Handle blur event
  const handleBlur = useCallback((path: string) => {
    setTouched(prev => ({ ...prev, [path]: true }));
    
    if (validate) {
      const validationErrors = validate(values);
      const pathKeys = path.split('.');
      const errorKey = pathKeys[0] as keyof T;
      
      if (validationErrors && validationErrors[errorKey]) {
        setErrors(prev => ({ ...prev, [errorKey]: validationErrors[errorKey] as string }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    }
  }, [values, validate]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
    setIsDirty(false);
    setTouched({});
  }, [initialValues]);

  // Submit form
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!onSubmit) return;
    
    setIsSubmitting(true);
    
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validate, values]);

  // Array operations
  const addToArray = useCallback((path: string, item: any) => {
    setIsDirty(true);
    setValues(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
          current[key] = [];
        }
        current = current[key];
      }
      
      const array = Array.isArray(current) ? current : (current[keys[keys.length - 1]] || []);
      array.push(item);
      return newData;
    });
  }, []);

  const removeFromArray = useCallback((path: string, index: number) => {
    setIsDirty(true);
    setValues(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current = current[key];
      }
      
      const array = Array.isArray(current) ? current : current[keys[keys.length - 1]];
      if (array && Array.isArray(array)) {
        array.splice(index, 1);
      }
      
      return newData;
    });
  }, []);

  const updateArrayItem = useCallback((path: string, index: number, updates: Partial<any>) => {
    setIsDirty(true);
    setValues(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current = current[key];
      }
      
      const array = Array.isArray(current) ? current : current[keys[keys.length - 1]];
      if (array && Array.isArray(array) && array[index]) {
        array[index] = { ...array[index], ...updates };
      }
      
      return newData;
    });
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    isDirty,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    getFieldValue,
    resetForm,
    setValues,
    // Array helpers
    addToArray,
    removeFromArray,
    updateArrayItem,
  };
}
