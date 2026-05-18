import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3002'
  : 'http://localhost:3002';

export const BACKEND_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3001'
  : 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export const CLOUD_NAME = 'dtjie5qfj';
export const UPLOAD_PRESET = 'meet-the-world';

export const cloudinary = axios.create({
  baseURL: BACKEND_URL,
  timeout: 5000,
});
