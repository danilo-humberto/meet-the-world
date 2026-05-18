import { Alert, Platform } from 'react-native';

export function mostrarAlerta(titulo, mensagem, aoFechar) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
    aoFechar?.();
    return;
  }

  if (aoFechar) {
    Alert.alert(titulo, mensagem, [{ text: 'OK', onPress: aoFechar }]);
    return;
  }

  Alert.alert(titulo, mensagem);
}
