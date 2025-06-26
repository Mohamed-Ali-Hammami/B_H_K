/** Utility Functions **/

// Get item from localStorage
export const getLocalStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error accessing localStorage key "${key}":`, error);
    return null;
  }
};

// Set item in localStorage
export const setLocalStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

// Remove item from localStorage
export const removeLocalStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
};
export const apiClient = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};


