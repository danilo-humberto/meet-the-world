import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { mostrarAlerta } from './alertaPerfil';
import { atualizarUsuarioPerfil, buscarUsuarioPerfil } from './perfilApi';

export default function EditarPerfilScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregarPerfil() {
    try {
      const usuario = await buscarUsuarioPerfil();

      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
      setFoto(usuario.foto || '');
    } catch (error) {
      mostrarAlerta('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setCarregando(false);
    }
  }

  async function salvarPerfil() {
    if (!nome.trim()) {
      mostrarAlerta('Nome obrigatório', 'Informe o nome do usuário para salvar.');
      return;
    }

    try {
      setSalvando(true);

      await atualizarUsuarioPerfil({
        nome: nome.trim(),
      });

      mostrarAlerta('Perfil atualizado', 'Os dados foram salvos no JSON Server.', () => {
        navigation.goBack();
      });
    } catch (error) {
      mostrarAlerta('Erro', 'Não foi possível salvar os dados do perfil.');
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0868df" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Editar Perfil</Text>

        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarCircle}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={58} color="#0868df" />
          )}
        </View>

        {carregando ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#0868df" />
            <Text style={styles.statusText}>Carregando perfil...</Text>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Nome</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person" size={21} color="#707b8c" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nome do usuário"
                placeholderTextColor="#8f99aa"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <Text style={styles.label}>E-mail</Text>
            <View style={[styles.inputBox, styles.disabledInputBox]}>
              <Ionicons name="mail" size={21} color="#8f99aa" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                editable={false}
                selectTextOnFocus={false}
                keyboardType="email-address"
              />
            </View>
            <Text style={styles.helpText}>O e-mail não pode ser alterado por esta tela.</Text>

            <TouchableOpacity
              style={[styles.saveButton, salvando && styles.saveButtonDisabled]}
              activeOpacity={0.85}
              disabled={salvando}
              onPress={salvarPerfil}
            >
              <Ionicons name="checkmark-circle" size={22} color="#ffffff" />
              <Text style={styles.saveButtonText}>
                {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 42,
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
  statusContainer: {
    marginTop: 36,
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
  form: {
    width: '100%',
    marginTop: 36,
  },
  label: {
    color: '#30394a',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputBox: {
    height: 58,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7ebf2',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  disabledInputBox: {
    backgroundColor: '#f7f9fc',
  },
  inputIcon: {
    width: 26,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    color: '#243042',
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  disabledInput: {
    color: '#8f99aa',
  },
  helpText: {
    color: '#737c8d',
    fontSize: 13,
    fontWeight: '600',
    marginTop: -8,
    marginBottom: 30,
  },
  saveButton: {
    height: 58,
    backgroundColor: '#0868df',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
