import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { initializeApp } from "firebase/app";
import CadastroScreen from './src/cadastro/CadastroScreen';
import LoginScreen from './src/login/LoginScreen';
import MainScreen from './src/main/MainScreen';
import DetalhePaisScreen from './src/pais/DetalhePaisScreen';
import AlterarFotoScreen from './src/perfil/AlterarFotoScreen';
import EditarPerfilScreen from './src/perfil/EditarPerfilScreen';

const Stack = createNativeStackNavigator();

const firebaseConfig = {
  apiKey: "AIzaSyBdCu3alZf28hOZkH-cfns9kPYlvLYkS6M",
  authDomain: "cloudinary-class.firebaseapp.com",
  projectId: "cloudinary-class",
  storageBucket: "cloudinary-class.firebasestorage.app",
  messagingSenderId: "308482449593",
  appId: "1:308482449593:web:cc2c95495c9223fb1cfb68"
};

initializeApp(firebaseConfig);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="DetalhePais" component={DetalhePaisScreen} />
        <Stack.Screen name="AlterarFoto" component={AlterarFotoScreen} />
        <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
