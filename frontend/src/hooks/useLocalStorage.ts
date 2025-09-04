import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Función para obtener el valor inicial del localStorage
  const getInitialValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getInitialValue);

  // Función para actualizar el valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Escuchar cambios en el localStorage desde otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        if (e.newValue === null) {
          // Si se eliminó la clave, usar el valor inicial
          setStoredValue(initialValue);
        } else {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.error(`Error parsing localStorage value for key "${key}":`, error);
            setStoredValue(initialValue);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  // Verificar periódicamente si el localStorage fue limpiado
  useEffect(() => {
    const checkLocalStorage = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item === null && storedValue !== initialValue) {
          // Si la clave no existe en localStorage pero tenemos un valor diferente al inicial
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error(`Error checking localStorage key "${key}":`, error);
      }
    };

    // Verificar inmediatamente
    checkLocalStorage();
    
    // Verificar cada segundo por si se limpia el localStorage
    const interval = setInterval(checkLocalStorage, 1000);
    
    return () => clearInterval(interval);
  }, [key, initialValue, storedValue]);

  return [storedValue, setValue] as const;
}

// Hook específico para gestionar múltiples objetos con ID
export function useLocalStorageArray<T extends { id: string }>(
  key: string, 
  initialValue: T[]
) {
  const [items, setItems] = useLocalStorage<T[]>(key, initialValue);

  const addItem = (item: T) => {
    setItems(prev => [...prev, item]);
  };

  const updateItem = (id: string, updates: Partial<T>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getItem = (id: string): T | undefined => {
    return items.find(item => item.id === id);
  };

  return {
    items,
    setItems,
    addItem,
    updateItem,
    removeItem,
    getItem,
  };
}
