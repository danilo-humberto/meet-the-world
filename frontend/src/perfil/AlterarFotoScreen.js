import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CLOUD_NAME,
  UPLOAD_PRESET,
  cloudinary,
} from '../services/api';
import { mostrarAlerta } from './alertaPerfil';
import { atualizarUsuarioPerfil, buscarUsuarioPerfil } from './perfilApi';

export default function AlterarFotoScreen({ navigation }) {
  const [imagemPerfil, setImagemPerfil] = useState('');
  const [fotoPublicId, setFotoPublicId] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function carregarFoto() {
    try {
      const usuario = await buscarUsuarioPerfil();

      setImagemPerfil(usuario.foto || '');
      setFotoPublicId(usuario.fotoPublicId || '');
    } catch (error) {
      mostrarAlerta('Erro', 'Não foi possível carregar a foto do perfil.');
    } finally {
      setCarregando(false);
    }
  }

  async function uploadToCloudinary(photo) {
    setUploading(true);

    const data = new FormData();

    if (Platform.OS === 'web' && photo.file) {
      data.append('file', photo.file);
    } else {
      data.append('file', {
        uri: photo.uri,
        type: photo.mimeType || photo.type || 'image/jpeg',
        name: photo.fileName || 'upload.jpg',
      });
    }

    data.append('upload_preset', UPLOAD_PRESET);
    data.append('tags', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
      });
      const result = await res.json();

      if (!result.secure_url) {
        mostrarAlerta('Erro no upload', 'Falha ao enviar imagem para Cloudinary.');
        return null;
      }

      return result;
    } catch (error) {
      mostrarAlerta('Erro no upload', error.message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(publicId) {
    try {
      const resposta = await cloudinary.delete('/delete-image', {
        data: {
          public_id: publicId,
        },
      });

      return resposta.data.result === 'ok' || resposta.data.result === 'not found';
    } catch (error) {
      mostrarAlerta('Erro', error.message);
      return false;
    }
  }

  async function salvarFoto(photo) {
    const fotoAntigaPublicId = fotoPublicId;
    const imagemCloudinary = await uploadToCloudinary(photo);

    if (!imagemCloudinary) {
      return;
    }

    try {
      setUploading(true);

      await atualizarUsuarioPerfil({
        foto: imagemCloudinary.secure_url,
        fotoPublicId: imagemCloudinary.public_id,
      });

      setImagemPerfil(imagemCloudinary.secure_url);
      setFotoPublicId(imagemCloudinary.public_id);

      if (fotoAntigaPublicId && fotoAntigaPublicId !== imagemCloudinary.public_id) {
        await deleteImage(fotoAntigaPublicId);
      }

      mostrarAlerta('Foto atualizada', 'A foto foi enviada ao Cloudinary e salva no JSON Server.');
    } catch (error) {
      mostrarAlerta('Erro', 'Não foi possível salvar a foto do perfil.');
    } finally {
      setUploading(false);
    }
  }

  function confirmarRemocaoFoto() {
    if (!imagemPerfil) {
      mostrarAlerta('Foto de perfil', 'Nenhuma foto cadastrada para remover.');
      return;
    }

    if (Platform.OS === 'web') {
      const confirmou = window.confirm('Deseja realmente remover esta imagem?');

      if (confirmou) {
        removerFoto();
      }

      return;
    }

    Alert.alert('Deletar imagem', 'Deseja realmente remover esta imagem?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: removerFoto,
      },
    ]);
  }

  async function removerFoto() {
    try {
      setUploading(true);

      if (fotoPublicId) {
        const deletou = await deleteImage(fotoPublicId);

        if (!deletou) {
          mostrarAlerta('Erro', 'Falha ao deletar imagem.');
          return;
        }
      }

      await atualizarUsuarioPerfil({
        foto: '',
        fotoPublicId: '',
      });

      setImagemPerfil('');
      setFotoPublicId('');
      mostrarAlerta('Sucesso', 'Imagem deletada.');
    } catch (error) {
      mostrarAlerta('Erro', 'Não foi possível remover a foto do perfil.');
    } finally {
      setUploading(false);
    }
  }

  async function escolherDaGaleria() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      mostrarAlerta('Permissão necessária', 'Permita o acesso à galeria para escolher uma foto.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      await salvarFoto(resultado.assets[0]);
    }
  }

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissao.granted) {
      mostrarAlerta('Permissão necessária', 'Permita o acesso à câmera para tirar uma foto.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      await salvarFoto(resultado.assets[0]);
    }
  }

  useEffect(() => {
    carregarFoto();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0868df" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Alterar Foto</Text>

        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarArea}>
          <View style={styles.avatarCircle}>
            {carregando ? (
              <ActivityIndicator size="large" color="#0868df" />
            ) : imagemPerfil ? (
              <Image source={{ uri: imagemPerfil }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={70} color="#0868df" />
            )}
          </View>

          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={24} color="#ffffff" />
          </View>
        </View>

        <Text style={styles.title}>Escolha uma imagem</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.secondaryButton, uploading && styles.buttonDisabled]}
            activeOpacity={0.85}
            disabled={uploading}
            onPress={escolherDaGaleria}
          >
            <Ionicons name="image" size={22} color="#0868df" />
            <Text style={styles.secondaryButtonText}>
              {uploading ? 'Enviando...' : 'Escolher da Galeria'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, uploading && styles.buttonDisabled]}
            activeOpacity={0.85}
            disabled={uploading}
            onPress={tirarFoto}
          >
            <Ionicons name="camera" size={22} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Tirar Foto</Text>
          </TouchableOpacity>

          {imagemPerfil ? (
            <TouchableOpacity
              style={[styles.deleteButton, uploading && styles.buttonDisabled]}
              activeOpacity={0.85}
              disabled={uploading}
              onPress={confirmarRemocaoFoto}
            >
              <Ionicons name="trash" size={22} color="#ff3b30" />
              <Text style={styles.deleteButtonText}>Remover Foto</Text>
            </TouchableOpacity>
          ) : null}
        </View>
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
    paddingTop: 66,
    alignItems: 'center',
  },
  avatarArea: {
    width: 142,
    height: 142,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 132,
    height: 132,
    backgroundColor: '#eaf2ff',
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 16,
    width: 42,
    height: 42,
    backgroundColor: '#0868df',
    borderRadius: 21,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#10182f',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 28,
  },
  subtitle: {
    color: '#737c8d',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 22,
    marginTop: 40,
  },
  secondaryButton: {
    height: 58,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7ebf2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButtonText: {
    color: '#0868df',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryButton: {
    height: 58,
    backgroundColor: '#0868df',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  deleteButton: {
    height: 58,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffd4d1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  deleteButtonText: {
    color: '#ff3b30',
    fontSize: 15,
    fontWeight: '800',
  },
});
