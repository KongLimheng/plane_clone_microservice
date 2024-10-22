export const getValueFromLocalStorage = (key: string, defaultValue: any) => {
  if (typeof window === undefined || typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    window.localStorage.removeItem(key);
    return defaultValue;
  }
};

export const setValueIntoLocalStorage = (key: string, value: any) => {
  if (typeof window === undefined || typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
};
