const getStorage = function (storageKey) {
  const value = uni.getStorageSync(storageKey);
  return value || "";
};

const setStorage = function (storageKey, value) {
  uni.setStorageSync(storageKey, value);
};

const removeStorage = function (storageKey) {
  uni.removeStorageSync(storageKey);
};

export { getStorage, setStorage, removeStorage };
