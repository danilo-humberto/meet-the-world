import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../home/HomeScreen';
import FavoritosScreen from '../favoritos/FavoritosScreen';
import PerfilScreen from '../perfil/PerfilScreen';

import './Main.css';

const tabs = [
  {
    key: 'Inicio',
    label: 'Início',
    icon: 'home',
  },
  {
    key: 'Favoritos',
    label: 'Favoritos',
    icon: 'heart',
  },
  {
    key: 'Perfil',
    label: 'Perfil',
    icon: 'person',
  },
];

export default function MainScreen({ navigation }) {
  const [abaAtiva, setAbaAtiva] = useState('Inicio');

  function renderizarTela() {
    if (abaAtiva === 'Favoritos') {
      return <FavoritosScreen />;
    }

    if (abaAtiva === 'Perfil') {
      return <PerfilScreen navigation={navigation} />;
    }

    return <HomeScreen navigation={navigation} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenContent}>{renderizarTela()}</View>

      <View style={styles.bottomNavigation}>
        {tabs.map((tab) => {
          const estaAtiva = tab.key === abaAtiva;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              activeOpacity={0.8}
              onPress={() => setAbaAtiva(tab.key)}
            >
              <Ionicons
                name={estaAtiva ? tab.icon : `${tab.icon}-outline`}
                size={23}
                color={estaAtiva ? '#0868df' : '#6f7888'}
              />
              <Text style={[styles.tabText, estaAtiva && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenContent: {
    flex: 1,
  },
  bottomNavigation: {
    height: 72,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e7ebf2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabText: {
    color: '#6f7888',
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#0868df',
  },
});
