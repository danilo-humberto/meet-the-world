import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { api } from '../services/api';
import { buscarUsuarioPerfil, getUsuarioIdFavoritos } from '../perfil/perfilApi';

const DETAIL_FIELDS = [
  'name',
  'translations',
  'capital',
  'population',
  'languages',
  'currencies',
  'region',
  'subregion',
  'continents',
  'timezones',
  'flags',
  'cca2',
  'cca3',
].join(',');

const regioes = {
  Africa: 'África',
  Americas: 'América',
  Asia: 'Ásia',
  Europe: 'Europa',
  Oceania: 'Oceania',
  Antarctic: 'Antártida',
};

const subRegioes = {
  'South America': 'América do Sul',
  'North America': 'América do Norte',
  'Central America': 'América Central',
  Caribbean: 'Caribe',
  'Western Europe': 'Europa Ocidental',
  'Eastern Europe': 'Europa Oriental',
  'Northern Europe': 'Europa do Norte',
  'Southern Europe': 'Europa do Sul',
  'Western Asia': 'Ásia Ocidental',
  'Eastern Asia': 'Ásia Oriental',
  'Southern Asia': 'Ásia do Sul',
  'South-Eastern Asia': 'Sudeste Asiático',
  'Northern Africa': 'África do Norte',
  'Southern Africa': 'África Austral',
  'Eastern Africa': 'África Oriental',
  'Western Africa': 'África Ocidental',
  'Middle Africa': 'África Central',
  Australia: 'Austrália',
  Melanesia: 'Melanésia',
  Micronesia: 'Micronésia',
  Polynesia: 'Polinésia',
};

function formatarPaisDetalhado(pais) {
  const capital = Array.isArray(pais.capital) ? pais.capital[0] : pais.capital;
  const continente = Array.isArray(pais.continents) ? pais.continents[0] : pais.continents;
  const codigoMoeda = pais.currencies ? Object.keys(pais.currencies)[0] : null;
  const moeda = codigoMoeda ? pais.currencies[codigoMoeda] : null;
  const nomeMoeda = moeda?.name === 'Brazilian real' ? 'Real' : moeda?.name;
  const fusoHorario = pais.timezones?.find((timezone) => timezone === 'UTC-03:00')
    || pais.timezones?.[0];

  return {
    codigo: pais.cca3 || pais.cca2,
    nome: pais.translations?.por?.common || pais.name?.common || 'País',
    nomeOficial: pais.translations?.por?.official || pais.name?.official || 'Nome oficial não informado',
    capital: capital || 'Não informada',
    populacao: pais.population?.toLocaleString('pt-BR') || 'Não informado',
    idioma: pais.languages ? Object.values(pais.languages).join(', ') : 'Não informado',
    moeda: nomeMoeda ? `${nomeMoeda} (${codigoMoeda})` : codigoMoeda || 'Não informado',
    regiao: regioes[pais.region] || pais.region || 'Não informado',
    subRegiao: subRegioes[pais.subregion] || pais.subregion || 'Não informado',
    continente: regioes[continente] || continente || 'Não informado',
    fusoHorario: fusoHorario || 'Não informado',
    bandeira: pais.flags?.png,
  };
}

export default function DetalhePaisScreen({ navigation, route }) {
  const { codigo, paisInicial } = route.params || {};
  const [pais, setPais] = useState(() => {
    if (!paisInicial) {
      return null;
    }

    return {
      nome: paisInicial.nome,
      nomeOficial: paisInicial.nomeOriginal,
      capital: paisInicial.capital,
      bandeira: paisInicial.bandeira,
    };
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [favorito, setFavorito] = useState(false);
  const [favoritoId, setFavoritoId] = useState(null);
  const [salvandoFavorito, setSalvandoFavorito] = useState(false);

  async function carregarDetalhes() {
    if (!codigo) {
      setErro('Código do país não encontrado.');
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      setErro('');

      const resposta = await axios.get(
        `https://restcountries.com/v3.1/alpha/${codigo}?fields=${DETAIL_FIELDS}`
      );
      const dados = Array.isArray(resposta.data) ? resposta.data[0] : resposta.data;

      setPais(formatarPaisDetalhado(dados));
    } catch (error) {
      setErro('Não foi possível carregar os detalhes do país.');
    } finally {
      setCarregando(false);
    }
  }

  async function carregarFavorito() {
    if (!codigo) {
      return;
    }

    try {
      const usuario = await buscarUsuarioPerfil();
      const usuarioId = getUsuarioIdFavoritos(usuario);

      const resposta = await api.get('/favoritos', {
        params: {
          'usuarioId:eq': usuarioId,
          'codigo:eq': codigo,
        },
      });
      const favoritoEncontrado = resposta.data[0];

      setFavorito(Boolean(favoritoEncontrado));
      setFavoritoId(favoritoEncontrado?.id || null);
    } catch (error) {
      setFavorito(false);
      setFavoritoId(null);
    }
  }

  async function alternarFavorito() {
    if (!pais || !codigo || salvandoFavorito) {
      return;
    }

    try {
      setSalvandoFavorito(true);
      const usuario = await buscarUsuarioPerfil();
      const usuarioId = getUsuarioIdFavoritos(usuario);

      if (favorito && favoritoId) {
        await api.delete(`/favoritos/${favoritoId}`);
        setFavorito(false);
        setFavoritoId(null);
        return;
      }

      const novoFavorito = {
        usuarioId,
        codigo,
        nome: pais.nome,
        capital: pais.capital,
        bandeira: pais.bandeira,
        imagem: pais.bandeira,
        createdAt: new Date().toISOString(),
      };

      const resposta = await api.post('/favoritos', novoFavorito);

      setFavorito(true);
      setFavoritoId(resposta.data.id);
    } catch (error) {
      Alert.alert(
        'Favoritos',
        'Não foi possível atualizar os favoritos. Verifique se o JSON Server está rodando.'
      );
    } finally {
      setSalvandoFavorito(false);
    }
  }

  useEffect(() => {
    carregarDetalhes();
    carregarFavorito();
  }, [codigo]);

  function renderizarLinha(icone, titulo, valor) {
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoLabel}>
          <Ionicons name={icone} size={19} color="#707b8c" />
          <Text style={styles.infoTitle}>{titulo}</Text>
        </View>
        <Text style={styles.infoValue}>{valor}</Text>
      </View>
    );
  }

  function renderizarConteudo() {
    if (carregando && !pais) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#0868df" />
          <Text style={styles.statusText}>Carregando detalhes...</Text>
        </View>
      );
    }

    if (erro && !pais) {
      return (
        <View style={styles.statusContainer}>
          <Ionicons name="alert-circle" size={42} color="#e24646" />
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={carregarDetalhes}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroArea}>
          <View style={styles.heroBackground}>
            {pais?.bandeira ? (
              <Image source={{ uri: pais.bandeira }} style={styles.heroFlag} />
            ) : (
              <Ionicons name="flag" size={58} color="#ffffff" />
            )}
          </View>

          <View style={styles.flagBadge}>
            {pais?.bandeira ? (
              <Image source={{ uri: pais.bandeira }} style={styles.flagBadgeImage} />
            ) : (
              <Ionicons name="flag" size={28} color="#707b8c" />
            )}
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.countryName}>{pais?.nome}</Text>
          <Text style={styles.officialName}>{pais?.nomeOficial}</Text>

          <View style={styles.infoList}>
            {renderizarLinha('location', 'Capital', pais?.capital)}
            {renderizarLinha('people', 'População', pais?.populacao)}
            {renderizarLinha('book', 'Idioma', pais?.idioma)}
            {renderizarLinha('cash', 'Moeda', pais?.moeda)}
            {renderizarLinha('map', 'Região', pais?.regiao)}
            {renderizarLinha('earth', 'Sub-região', pais?.subRegiao)}
            {renderizarLinha('globe', 'Continente', pais?.continente)}
            {renderizarLinha('time', 'Fuso horário', pais?.fusoHorario)}
          </View>

          {erro ? <Text style={styles.inlineError}>{erro}</Text> : null}

          <TouchableOpacity
            style={[styles.favoriteButton, salvandoFavorito && styles.favoriteButtonDisabled]}
            activeOpacity={0.85}
            disabled={salvandoFavorito}
            onPress={alternarFavorito}
          >
            <Ionicons name={favorito ? 'heart' : 'heart-outline'} size={21} color="#ffffff" />
            <Text style={styles.favoriteButtonText}>
              {salvandoFavorito
                ? 'Salvando...'
                : favorito
                  ? 'Remover dos Favoritos'
                  : 'Adicionar aos Favoritos'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0868df" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalhes do País</Text>

        <TouchableOpacity style={styles.headerButton} onPress={alternarFavorito}>
          <Ionicons name={favorito ? 'heart' : 'heart-outline'} size={25} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {renderizarConteudo()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0868df',
  },
  header: {
    height: 58,
    backgroundColor: '#0868df',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
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
  scrollContent: {
    backgroundColor: '#ffffff',
    paddingBottom: 28,
  },
  heroArea: {
    height: 214,
    backgroundColor: '#ffffff',
  },
  heroBackground: {
    height: 184,
    backgroundColor: '#0b74e5',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroFlag: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  flagBadge: {
    position: 'absolute',
    left: 24,
    bottom: 0,
    width: 82,
    height: 58,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7ebf2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flagBadgeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  details: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  countryName: {
    color: '#10182f',
    fontSize: 31,
    fontWeight: '800',
  },
  officialName: {
    color: '#737c8d',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  infoList: {
    marginTop: 26,
    gap: 17,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  infoTitle: {
    color: '#4d5666',
    fontSize: 15,
    fontWeight: '800',
  },
  infoValue: {
    flex: 1,
    color: '#20293a',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  inlineError: {
    color: '#e24646',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 18,
    textAlign: 'center',
  },
  favoriteButton: {
    height: 58,
    backgroundColor: '#0868df',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 30,
  },
  favoriteButtonDisabled: {
    opacity: 0.7,
  },
  favoriteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  statusContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
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
