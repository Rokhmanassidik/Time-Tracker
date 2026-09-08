import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { readJSON, writeJSON } from '../lib/storage';

export function useLocalStorageState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readJSON(key, initialValue));

  useEffect(() => {
    writeJSON(key, value);
  }, [key, value]);

  return [value, setValue];
}
