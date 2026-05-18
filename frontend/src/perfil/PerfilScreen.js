import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getAuth, signOut } from "firebase/auth";
import { api } from '../services/api';
import { buscarUsuarioPerfil, getUsuarioIdFavoritos } from './perfilApi';

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
  const [usuario, setUsuario] = useState(null);
  const [totalFavoritos, setTotalFavoritos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  function sair() {
    const auth = getAuth();

    signOut(auth).then(() => {
      navigation.navigate('Login')
    }).catch((error) => {
      setErro("Erro ao sair da conta")
    })
  }

  async function carregarPerfil() {
    try {
      setErro('');
      const usuarioEncontrado = await buscarUsuarioPerfil();

      setUsuario(usuarioEncontrado);
    } catch (error) {
      setErro('Não foi possível carregar os dados do perfil.');
    } finally {
      setCarregando(false);
    }
  }

  async function carregarTotalFavoritos() {
    try {
      const usuarioEncontrado = await buscarUsuarioPerfil();
      const usuarioId = getUsuarioIdFavoritos(usuarioEncontrado);

      const resposta = await api.get('/favoritos', {
        params: {
          'usuarioId:eq': usuarioId,
        },
      });

      setTotalFavoritos(resposta.data.length);
    } catch (error) {
      setTotalFavoritos(0);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarPerfil();
      carregarTotalFavoritos();
    });

    carregarTotalFavoritos();
    carregarPerfil();

    return unsubscribe;
  }, [navigation]);

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
        {carregando ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#0868df" />
            <Text style={styles.statusText}>Carregando perfil...</Text>
          </View>
        ) : (
          <>
            <View style={styles.avatarArea}>
              <View style={styles.avatarCircle}>
                {usuario?.foto ? (
                  <Image source={{ uri: usuario.foto }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={58} color="#0868df" />
                )}
              </View>

              <Text style={styles.userName}>{usuario?.nome || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{usuario?.email || 'E-mail não informado'}</Text>
              {erro ? <Text style={styles.errorText}>{erro}</Text> : null}
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
          </>
        )}
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#5f6878',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#e24646',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
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
