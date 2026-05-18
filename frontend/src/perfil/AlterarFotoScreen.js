import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

import './AlterarFoto.css';

export default function AlterarFotoScreen({ navigation }) {
  const [imagemPerfil, setImagemPerfil] = useState(null);

  async function escolherDaGaleria() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para escolher uma foto.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagemPerfil(resultado.assets[0].uri);
    }
  }

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar uma foto.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagemPerfil(resultado.assets[0].uri);
    }
  }

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
            {imagemPerfil ? (
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
        <Text style={styles.subtitle}>Sua foto será enviada para o Cloudinary</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={escolherDaGaleria}
          >
            <Ionicons name="image" size={22} color="#0868df" />
            <Text style={styles.secondaryButtonText}>Escolher da Galeria</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={tirarFoto}>
            <Ionicons name="camera" size={22} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Tirar Foto</Text>
          </TouchableOpacity>
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
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
