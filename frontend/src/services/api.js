import { Platform } from 'react-native';
import axios from 'axios';

const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3002'
  : 'http://localhost:3002';

export const USUARIO_PADRAO_ID = 1;

export const api = axios.create({
  baseURL: API_BASE_URL,
});
