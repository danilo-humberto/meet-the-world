import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { api, USUARIO_PADRAO_ID } from '../services/api';
import './Perfil.css';

const opcoesPerfil = [
  {
    id: 'editar',
    titulo: 'Editar Perfil',
    icone: 'create',
  },
  {
    id: 'foto',
    titulo: 'Alterar Foto',
    icone: 'image',
  },
];

export default function PerfilScreen({ navigation }) {
  const [totalFavoritos, setTotalFavoritos] = useState(0);

  function sair() {
    navigation.replace('Login');
  }

  async function carregarTotalFavoritos() {
    try {
      const resposta = await api.get('/favoritos', {
        params: {
          'usuarioId:eq': USUARIO_PADRAO_ID,
        },
      });

      setTotalFavoritos(resposta.data.length);
    } catch (error) {
      setTotalFavoritos(0);
    }
  }

  useEffect(() => {
    carregarTotalFavoritos();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0868df" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="menu" size={26} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Meu Perfil</Text>

        <View style={styles.iconButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarArea}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={58} color="#0868df" />
          </View>

          <Text style={styles.userName}>João da Silva</Text>
          <Text style={styles.userEmail}>joao@email.com</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Favoritos</Text>
            <Text style={styles.statValue}>{totalFavoritos}</Text>
          </View>
        </View>

        <View style={styles.optionsCard}>
          {opcoesPerfil.map((opcao) => (
            <TouchableOpacity
              key={opcao.id}
              style={styles.optionItem}
              activeOpacity={0.8}
              onPress={() => {
                if (opcao.id === 'editar') {
                  navigation.navigate('EditarPerfil');
                }

                if (opcao.id === 'foto') {
                  navigation.navigate('AlterarFoto');
                }
              }}
            >
              <Ionicons name={opcao.icone} size={21} color="#687485" />
              <Text style={styles.optionText}>{opcao.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutCard} activeOpacity={0.8} onPress={sair}>
          <Ionicons name="log-out-outline" size={23} color="#ff3b30" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0868df',
  },
  header: {
    height: 66,
    backgroundColor: '#0868df',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  avatarArea: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 112,
    height: 112,
    backgroundColor: '#eaf2ff',
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: '#10182f',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 14,
  },
  userEmail: {
    color: '#5f6878',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  statsRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statCard: {
    width: 128,
    minHeight: 74,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7ebf2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: '#5f6878',
    fontSize: 13,
    fontWeight: '800',
  },
  statValue: {
    color: '#10182f',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 6,
  },
  optionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7ebf2',
    marginTop: 24,
    overflow: 'hidden',
  },
  optionItem: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f5',
  },
  optionText: {
    color: '#30394a',
    fontSize: 15,
    fontWeight: '800',
  },
  logoutCard: {
    height: 58,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7ebf2',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 15,
    fontWeight: '800',
  },
});
