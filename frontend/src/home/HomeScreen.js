import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const COUNTRIES_URL =
  'https://restcountries.com/v3.1/all?fields=name,translations,capital,flags,cca2,cca3';

function normalizarTexto(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatarPais(pais) {
  const nome = pais.translations?.por?.common || pais.name?.common || 'País sem nome';
  const nomeOriginal = pais.name?.common || nome;
  const capital = Array.isArray(pais.capital) && pais.capital.length > 0
    ? pais.capital[0]
    : 'Capital não informada';

  return {
    id: pais.cca3 || pais.cca2 || nome,
    codigo: pais.cca3 || pais.cca2,
    nome,
    nomeOriginal,
    capital,
    bandeira: pais.flags?.png,
  };
}

export default function HomeScreen({ navigation }) {
  const [paises, setPaises] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregarPaises() {
    try {
      setCarregando(true);
      setErro('');

      const resposta = await axios.get(COUNTRIES_URL);
      const paisesFormatados = resposta.data
        .map(formatarPais)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

      setPaises(paisesFormatados);
    } catch (error) {
      setErro('Não foi possível carregar os países. Verifique sua conexão e tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPaises();
  }, []);

  const paisesFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca.trim());

    if (!termo) {
      return paises;
    }

    return paises.filter((pais) => {
      const nome = normalizarTexto(pais.nome);
      const nomeOriginal = normalizarTexto(pais.nomeOriginal);
      const capital = normalizarTexto(pais.capital);

      return nome.includes(termo) || nomeOriginal.includes(termo) || capital.includes(termo);
    });
  }, [busca, paises]);

  function renderizarPais({ item }) {
    return (
      <TouchableOpacity
        style={styles.countryCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('DetalhePais', {
          codigo: item.codigo,
          paisInicial: item,
        })}
      >
        {item.bandeira ? (
          <Image source={{ uri: item.bandeira }} style={styles.flagImage} />
        ) : (
          <View style={styles.flagFallback}>
            <Ionicons name="flag" size={22} color="#707b8c" />
          </View>
        )}

        <View style={styles.countryInfo}>
          <Text style={styles.countryName}>{item.nome}</Text>
          <Text style={styles.countryCapital}>Capital: {item.capital}</Text>
        </View>

        <Ionicons name="chevron-forward" size={22} color="#7b8493" />
      </TouchableOpacity>
    );
  }

  function renderizarConteudo() {
    if (carregando) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#0868df" />
          <Text style={styles.statusText}>Carregando países...</Text>
        </View>
      );
    }

    if (erro) {
      return (
        <View style={styles.statusContainer}>
          <Ionicons name="alert-circle" size={42} color="#e24646" />
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={carregarPaises}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={paisesFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderizarPais}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.statusContainer}>
            <Ionicons name="search" size={38} color="#8f99aa" />
            <Text style={styles.statusText}>Nenhum país encontrado.</Text>
          </View>
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0868df" />

      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu" size={26} color="#ffffff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Países</Text>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={23} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#7b8493" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar país..."
            placeholderTextColor="#8f99aa"
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.content}>{renderizarConteudo()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#0868df',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  topBar: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  searchBox: {
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#243042',
    fontSize: 15,
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 14,
    gap: 10,
  },
  countryCard: {
    minHeight: 78,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e7ebf2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagImage: {
    width: 54,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#edf0f5',
    resizeMode: 'cover',
  },
  flagFallback: {
    width: 54,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#edf0f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryInfo: {
    flex: 1,
    marginLeft: 14,
  },
  countryName: {
    color: '#20293a',
    fontSize: 16,
    fontWeight: '800',
  },
  countryCapital: {
    color: '#5f6878',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  statusContainer: {
    flex: 1,
    minHeight: 320,
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
