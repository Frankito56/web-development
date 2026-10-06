/**
 * UniLib - useLocalStorage Hook
 * Type-safe state synchronized with localStorage.
 */

import { useState, useEffect } from 'react';
import { StorageService } from '@/services/storageService';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return StorageService.getItem<T>(key, initialValue);
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(StorageService.getItem<T>(key, initialValue));
    };

    const unsubscribe = StorageService.subscribe(handleStorageChange);
    return () => unsubscribe();
  }, [key, initialValue]);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      StorageService.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
