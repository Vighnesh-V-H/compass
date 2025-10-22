export function setToLocalStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error("Error setting to localStorage:", error);
  }
}

export function getFromLocalStorage<T>(key: string): T | null {
  try {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  } catch (error) {
    console.error("Error getting from localStorage:", error);
    return null;
  }
}

export function deleteFromLocalStorage(key: string): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error("Error deleting from localStorage:", error);
  }
}
