import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

const __key__ = 'settings';

/**
 * Generic hook for managing localStorage with React state
 * All values are stored within a root "settings" object in localStorage
 * Supports nested keys using dot notation (e.g., 'dashboard.something')
 * @param key - The key within the settings object (e.g., 'countries' or 'dashboard.something')
 * @param initialValue - The initial value if key doesn't exist in localStorage
 * @returns A tuple containing the current value, setter function, and getter function
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => T | null] {
  // Helper function to get the entire settings object from localStorage
  const getSettings = useCallback((): Record<string, any> => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const item = window.localStorage.getItem(__key__);
      return item ? JSON.parse(item) : {};
    } catch (error) {
      console.error(`Error reading settings from localStorage:`, error);
      return {};
    }
  }, []);

  // Helper function to save the entire settings object to localStorage
  const saveSettings = useCallback((settings: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(__key__, JSON.stringify(settings));
      } catch (error) {
        console.error(`Error saving settings to localStorage:`, error);
      }
    }
  }, []);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const settings = getSettings();
      const value = _.get(settings, key);
      return value !== undefined ? value : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage within the settings object.
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage within the settings object using lodash set for nested keys
        if (typeof window !== 'undefined') {
          const settings = getSettings();
          _.set(settings, key, valueToStore);
          saveSettings(settings);
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, getSettings, saveSettings]
  );

  // Getter function to manually retrieve the current value from localStorage
  const getValue = useCallback((): T | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const settings = getSettings();
      const value = _.get(settings, key);
      return value !== undefined ? value : null;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  }, [key, getSettings]);

  // Listen for changes to the settings key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === __key__ && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          const value = _.get(settings, key);
          if (value !== undefined) {
            setStoredValue(value);
          }
        } catch (error) {
          console.error(`Error parsing storage event for settings:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, getValue];
}
