import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { api } from '../services/api';
import { buscarUsuarioPerfil, getUsuarioIdFavoritos } from '../perfil/perfilApi';

export default function FavoritosScreen() {
  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregarFavoritos() {
    try {
      setCarregando(true);
      setErro('');

      const usuario = await buscarUsuarioPerfil();
      const usuarioId = getUsuarioIdFavoritos(usuario);

      const resposta = await api.get('/favoritos', {
        params: {
          'usuarioId:eq': usuarioId,
        },
      });

      setFavoritos(resposta.data);
    } catch (error) {
      setErro('Não foi possível carregar os favoritos.');
    } finally {
      setCarregando(false);
    }
  }

  async function removerFavorito(id) {
    try {
      await api.delete(`/favoritos/${id}`);
      setFavoritos((listaAtual) => listaAtual.filter((favorito) => favorito.id !== id));
    } catch (error) {
      setErro('Não foi possível remover o favorito.');
    }
  }

  useEffect(() => {
    carregarFavoritos();
  }, []);

  function renderizarFavorito({ item }) {
    return (
      <TouchableOpacity style={styles.favoriteItem} activeOpacity={0.85}>
        {item.imagem || item.bandeira ? (
          <Image source={{ uri: item.imagem || item.bandeira }} style={styles.favoriteImage} />
        ) : (
          <View style={styles.favoriteImageFallback}>
            <Ionicons name="flag" size={28} color="#707b8c" />
          </View>
        )}

        <View style={styles.favoriteInfo}>
          <Text style={styles.countryName}>{item.nome}</Text>
          <Text style={styles.countryCapital}>Capital: {item.capital}</Text>
        </View>

        <TouchableOpacity
          style={styles.heartButton}
          activeOpacity={0.8}
          onPress={() => removerFavorito(item.id)}
        >
          <Ionicons name="heart" size={24} color="#ff2d3d" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  function renderizarConteudo() {
    if (carregando) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#0868df" />
          <Text style={styles.statusText}>Carregando favoritos...</Text>
        </View>
      );
    }

    if (erro) {
      return (
        <View style={styles.statusContainer}>
          <Ionicons name="alert-circle" size={42} color="#e24646" />
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={carregarFavoritos}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={favoritos}
        keyExtractor={(item) => item.id}
        renderItem={renderizarFavorito}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.statusContainer}>
            <Ionicons name="heart-outline" size={42} color="#8f99aa" />
            <Text style={styles.statusText}>Nenhum país favoritado ainda.</Text>
          </View>
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0868df" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="menu" size={26} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Meus Favoritos</Text>

        <View style={styles.iconButton} />
      </View>

      <View style={styles.content}>{renderizarConteudo()}</View>
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
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },
  favoriteItem: {
    minHeight: 96,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9edf3',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteImage: {
    width: 118,
    height: 76,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  favoriteImageFallback: {
    width: 118,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#e7ebf2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 16,
  },
  countryName: {
    color: '#20293a',
    fontSize: 17,
    fontWeight: '800',
  },
  countryCapital: {
    color: '#5f6878',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 5,
  },
  heartButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  statusText: {
    color: '#5f6878',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#5f6878',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    height: 46,
    paddingHorizontal: 20,
    backgroundColor: '#0868df',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
