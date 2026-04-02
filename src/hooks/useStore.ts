import { useState, useCallback } from 'react';

export function useStore<T extends { id: string }>(initialData: T[]) {
  const [items, setItems] = useState<T[]>(initialData);

  const add = useCallback((item: Omit<T, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() } as T;
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, []);

  const update = useCallback((id: string, data: Partial<T>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return { items, add, update, remove, setItems };
}
