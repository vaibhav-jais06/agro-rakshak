import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';
import { Share } from '@capacitor/share';
import { PushNotifications } from '@capacitor/push-notifications';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};

export const takePhoto = async (options = {}) => {
  try {
    const photo = await Camera.getPhoto({
      quality: options.quality || 90,
      allowEditing: options.allowEditing || false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
      ...options,
    });

    return {
      success: true,
      photo: photo,
      webPath: photo.webPath,
      format: photo.format,
    };
  } catch (error) {
    console.error('Camera error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


export const pickImage = async (options = {}) => {
  try {
    const photo = await Camera.getPhoto({
      quality: options.quality || 90,
      allowEditing: options.allowEditing || false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      correctOrientation: true,
      ...options,
    });

    return {
      success: true,
      photo: photo,
      webPath: photo.webPath,
      format: photo.format,
    };
  } catch (error) {
    console.error('Gallery picker error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const requestCameraPermissions = async () => {
  try {
    const permissions = await Camera.requestPermissions();
    return permissions.camera === 'granted';
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
};

export const getCurrentLocation = async (options = {}) => {
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: options.highAccuracy !== false,
      timeout: options.timeout || 10000,
      maximumAge: options.maximumAge || 0,
    });

    return {
      success: true,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      timestamp: position.timestamp,
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return {
      success: false,
      error: error.message,
      latitude: 28.7041,
      longitude: 77.1025,
    };
  }
};

export const watchLocation = async (callback) => {
  try {
    const watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
      (position, error) => {
        if (error) {
          console.error('Watch location error:', error);
          callback({ success: false, error });
        } else {
          callback({
            success: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        }
      }
    );
    return watchId;
  } catch (error) {
    console.error('Watch location error:', error);
    return null;
  }
};


export const clearLocationWatch = async (watchId) => {
  if (watchId) {
    await Geolocation.clearWatch({ id: watchId });
  }
};


export const requestLocationPermissions = async () => {
  try {
    const permissions = await Geolocation.requestPermissions();
    return permissions.location === 'granted';
  } catch (error) {
    console.error('Location permission error:', error);
    return false;
  }
};

export const setStorageItem = async (key, value) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await Preferences.set({ key, value: stringValue });
    return { success: true };
  } catch (error) {
    console.error('Storage set error:', error);
    return { success: false, error: error.message };
  }
};


export const getStorageItem = async (key) => {
  try {
    const { value } = await Preferences.get({ key });
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error('Storage get error:', error);
    return null;
  }
};

export const removeStorageItem = async (key) => {
  try {
    await Preferences.remove({ key });
    return { success: true };
  } catch (error) {
    console.error('Storage remove error:', error);
    return { success: false, error: error.message };
  }
};

export const clearStorage = async () => {
  try {
    await Preferences.clear();
    return { success: true };
  } catch (error) {
    console.error('Storage clear error:', error);
    return { success: false, error: error.message };
  }
};

export const getStorageKeys = async () => {
  try {
    const { keys } = await Preferences.keys();
    return keys;
  } catch (error) {
    console.error('Storage keys error:', error);
    return [];
  }
};

export const setStatusBarStyle = async (style = 'DARK') => {
  if (!isNativePlatform()) return;
  
  try {
    await StatusBar.setStyle({ style: style === 'DARK' ? Style.Dark : Style.Light });
  } catch (error) {
    console.error('Status bar style error:', error);
  }
};


export const setStatusBarColor = async (color) => {
  if (!isNativePlatform() || getPlatform() !== 'android') return;
  
  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.error('Status bar color error:', error);
  }
};

export const setStatusBarVisible = async (visible) => {
  if (!isNativePlatform()) return;
  
  try {
    if (visible) {
      await StatusBar.show();
    } else {
      await StatusBar.hide();
    }
  } catch (error) {
    console.error('Status bar visibility error:', error);
  }
};

export const showKeyboard = async () => {
  if (!isNativePlatform()) return;
  
  try {
    await Keyboard.show();
  } catch (error) {
    console.error('Keyboard show error:', error);
  }
};

export const hideKeyboard = async () => {
  if (!isNativePlatform()) return;
  
  try {
    await Keyboard.hide();
  } catch (error) {
    console.error('Keyboard hide error:', error);
  }
};


export const getNetworkStatus = async () => {
  try {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType,
    };
  } catch (error) {
    console.error('Network status error:', error);
    return { connected: true, connectionType: 'unknown' };
  }
};

/**
 * Listen to network status changes
 * @param {Function} callback - Called on network change
 */
export const addNetworkListener = (callback) => {
  return Network.addListener('networkStatusChange', (status) => {
    callback({
      connected: status.connected,
      connectionType: status.connectionType,
    });
  });
};


export const getAppInfo = async () => {
  try {
    const info = await App.getInfo();
    return info;
  } catch (error) {
    console.error('App info error:', error);
    return null;
  }
};


export const addAppStateListener = (callback) => {
  return App.addListener('appStateChange', ({ isActive }) => {
    callback(isActive);
  });
};

export const exitApp = () => {
  if (getPlatform() === 'android') {
    App.exitApp();
  }
};


export const shareContent = async (options = {}) => {
  try {
    await Share.share({
      title: options.title || 'Share from Agro Rakshak',
      text: options.text || '',
      url: options.url || '',
      dialogTitle: options.dialogTitle || 'Share with',
    });
    return { success: true };
  } catch (error) {
    console.error('Share error:', error);
    return { success: false, error: error.message };
  }
};

export const canShare = async () => {
  try {
    const result = await Share.canShare();
    return result.value;
  } catch (error) {
    return false;
  }
};

export const requestNotificationPermissions = async () => {
  if (!isNativePlatform()) return false;
  
  try {
    const result = await PushNotifications.requestPermissions();
    return result.receive === 'granted';
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};


export const registerPushNotifications = async () => {
  if (!isNativePlatform()) return;
  
  try {
    await PushNotifications.register();
  } catch (error) {
    console.error('Push registration error:', error);
  }
};

export const addPushNotificationListener = (callback) => {
  if (!isNativePlatform()) return;
  
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    callback(notification);
  });
};


export const addPushActionListener = (callback) => {
  if (!isNativePlatform()) return;
  
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    callback(action);
  });
};


export const getDeliveredNotifications = async () => {
  if (!isNativePlatform()) return [];
  
  try {
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  } catch (error) {
    console.error('Get delivered notifications error:', error);
    return [];
  }
};


export const initializeCapacitor = async () => {
  if (!isNativePlatform()) {
    console.log('Running on web platform');
    return;
  }

  console.log(`Initializing Capacitor on ${getPlatform()}`);

  try {
    // Set status bar style
    await setStatusBarStyle('DARK');
    await setStatusBarColor('#2d5016');

    // Get app info
    const appInfo = await getAppInfo();
    console.log('App Info:', appInfo);

    // Check network status
    const networkStatus = await getNetworkStatus();
    console.log('Network Status:', networkStatus);

    console.log('Capacitor initialized successfully');
  } catch (error) {
    console.error('Capacitor initialization error:', error);
  }
};

export default {
  isNativePlatform,
  getPlatform,
  takePhoto,
  pickImage,
  requestCameraPermissions,
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
  requestLocationPermissions,
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  getStorageKeys,
  setStatusBarStyle,
  setStatusBarColor,
  setStatusBarVisible,
  showKeyboard,
  hideKeyboard,
  getNetworkStatus,
  addNetworkListener,
  getAppInfo,
  addAppStateListener,
  exitApp,
  shareContent,
  canShare,
  requestNotificationPermissions,
  registerPushNotifications,
  addPushNotificationListener,
  addPushActionListener,
  getDeliveredNotifications,
  initializeCapacitor,
};
