import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

/**
 * Loads data each time the screen gains focus, so edits made in forms show up
 * on return. `reload` refreshes after a change made on the screen itself.
 */
export function useFocusedLoad<T>(
  load: () => Promise<T>,
): readonly [T | undefined, () => Promise<void>] {
  const [data, setData] = useState<T>();
  const focused = useRef(false);

  const reload = useCallback(async () => {
    const result = await load();
    if (focused.current) {
      setData(result);
    }
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      reload();
      return () => {
        focused.current = false;
      };
    }, [reload]),
  );

  return [data, reload];
}
