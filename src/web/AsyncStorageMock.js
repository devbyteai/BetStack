const storage = {};

const AsyncStorage = {
  getItem: async (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return storage[key] || null;
    }
  },
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      storage[key] = value;
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      delete storage[key];
    }
  },
  clear: async () => {
    try {
      localStorage.clear();
    } catch {
      Object.keys(storage).forEach(key => delete storage[key]);
    }
  },
  getAllKeys: async () => {
    try {
      return Object.keys(localStorage);
    } catch {
      return Object.keys(storage);
    }
  },
  multiGet: async (keys) => {
    return Promise.all(keys.map(async (key) => [key, await AsyncStorage.getItem(key)]));
  },
  multiSet: async (pairs) => {
    await Promise.all(pairs.map(([key, value]) => AsyncStorage.setItem(key, value)));
  },
  multiRemove: async (keys) => {
    await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
  },
};

export default AsyncStorage;
