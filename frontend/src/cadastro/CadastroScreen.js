import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { api } from '../services/api';

function mostrarAlerta(titulo, mensagem, aoFechar) {
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

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function voltarParaLogin() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Login');
  }

  async function cadastrarUsuario() {
    if (!nome.trim() || !email.trim() || !senha.trim() || !confirmarSenha.trim()) {
      mostrarAlerta('Campos obrigatórios', 'Preencha todos os campos para continuar.');
      return;
    }

    if (senha !== confirmarSenha) {
      mostrarAlerta('Senhas diferentes', 'A senha e a confirmação precisam ser iguais.');
      return;
    }

    try {
      setSalvando(true);

      const emailNormalizado = email.trim().toLowerCase();
      const auth = getAuth();
      const credencial = await createUserWithEmailAndPassword(auth, emailNormalizado, senha);

      try {
        await api.post('/usuarios', {
          firebaseUid: credencial.user.uid,
          nome: nome.trim(),
          email: emailNormalizado,
          foto: '',
          fotoPublicId: '',
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        mostrarAlerta(
          'Conta criada',
          'A conta foi criada no Firebase, mas não foi salva no JSON Server. Verifique se ele está rodando.'
        );
        return;
      }

      mostrarAlerta(
        'Cadastro realizado',
        'Cadastro realizado com sucesso.',
        () => navigation.navigate('Login')
      );
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        mostrarAlerta('E-mail já cadastrado', 'Já existe uma conta com esse e-mail.');
        return;
      }

      mostrarAlerta(
        'Erro ao cadastrar',
        'Não foi possível realizar o cadastro. Verifique os dados e tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={voltarParaLogin}>
          <Ionicons name="chevron-back" size={28} color="#14213d" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputBox}>
            <Ionicons name="person" size={20} color="#707b8c" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#8f99aa"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="mail" size={20} color="#707b8c" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#8f99aa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="lock-closed" size={20} color="#707b8c" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#8f99aa"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            >
              <Ionicons
                name={mostrarSenha ? 'eye-off' : 'eye'}
                size={22}
                color="#687485"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="lock-closed" size={20} color="#707b8c" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              placeholderTextColor="#8f99aa"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!mostrarConfirmarSenha}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
            >
              <Ionicons
                name={mostrarConfirmarSenha ? 'eye-off' : 'eye'}
                size={22}
                color="#687485"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, salvando && styles.registerButtonDisabled]}
            activeOpacity={0.8}
            disabled={salvando}
            onPress={cadastrarUsuario}
          >
            <Text style={styles.registerButtonText}>
              {salvando ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginArea}>
          <Text style={styles.loginText}>Já tem conta?</Text>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Faça login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  header: {
    marginTop: 28,
    marginBottom: 32,
  },
  title: {
    color: '#10182f',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#737c8d',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  inputBox: {
    height: 58,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e8ef',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    width: 26,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    color: '#243042',
    fontSize: 15,
    paddingHorizontal: 8,
  },
  eyeButton: {
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButton: {
    height: 58,
    backgroundColor: '#0868df',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  loginArea: {
    marginTop: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginText: {
    color: '#384252',
    fontSize: 15,
    fontWeight: '700',
  },
  loginLink: {
    color: '#0868df',
    fontSize: 15,
    fontWeight: '800',
  },
});
