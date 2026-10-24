import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

/** Loads data each time the screen gains focus, so edits made in forms show up on return. */
export function useFocusedLoad<T>(load: () => Promise<T>): T | undefined {
  const [data, setData] = useState<T>();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      load().then(result => {
        if (active) {
          setData(result);
        }
      });
      return () => {
        active = false;
      };
    }, [load]),
  );

  return data;
}
