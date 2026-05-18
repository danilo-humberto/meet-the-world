import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/login/LoginScreen';
import CadastroScreen from './src/cadastro/CadastroScreen';
import MainScreen from './src/main/MainScreen';
import DetalhePaisScreen from './src/pais/DetalhePaisScreen';
import AlterarFotoScreen from './src/perfil/AlterarFotoScreen';
import EditarPerfilScreen from './src/perfil/EditarPerfilScreen';

const Stack = createNativeStackNavigator();

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
