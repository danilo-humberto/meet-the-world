import { getAuth } from 'firebase/auth';

import { api } from '../services/api';

function formatarNomeUsuario(usuarioFirebase) {
  return usuarioFirebase.displayName
    || usuarioFirebase.email?.split('@')[0]
    || 'Usuário';
}

async function completarFirebaseUid(usuario, usuarioFirebase) {
  if (!usuario?.id || usuario.firebaseUid || !usuarioFirebase?.uid) {
    return usuario;
  }

  const resposta = await api.patch(`/usuarios/${usuario.id}`, {
    firebaseUid: usuarioFirebase.uid,
  });

  return resposta.data;
}

export function getUsuarioIdFavoritos(usuario) {
  const id = usuario?.id;
  const idNumerico = Number(id);

  if (String(idNumerico) === String(id)) {
    return idNumerico;
  }

  return id;
}

export async function buscarUsuarioPerfil() {
  const usuarioFirebase = getAuth().currentUser;

  if (!usuarioFirebase) {
    throw new Error('Usuário não autenticado.');
  }

  if (usuarioFirebase?.uid) {
    try {
      const resposta = await api.get('/usuarios', {
        params: {
          'firebaseUid:eq': usuarioFirebase.uid,
        },
      });

      if (resposta.data.length > 0) {
        return resposta.data[0];
      }
    } catch (error) {
      // Se nao encontrar pelo uid do Firebase, tenta buscar pelo e-mail abaixo.
    }
  }

  if (usuarioFirebase?.email) {
    try {
      const resposta = await api.get('/usuarios', {
        params: {
          'email:eq': usuarioFirebase.email.toLowerCase(),
        },
      });

      if (resposta.data.length > 0) {
        return completarFirebaseUid(resposta.data[0], usuarioFirebase);
      }
    } catch (error) {
      // Se nao encontrar pelo e-mail, cria o usuario abaixo.
    }
  }

  const resposta = await api.post('/usuarios', {
    firebaseUid: usuarioFirebase.uid,
    nome: formatarNomeUsuario(usuarioFirebase),
    email: usuarioFirebase.email?.toLowerCase() || '',
    foto: '',
    fotoPublicId: '',
    createdAt: new Date().toISOString(),
  });

  return resposta.data;
}

export async function atualizarUsuarioPerfil(dados) {
  const usuario = await buscarUsuarioPerfil();
  const resposta = await api.patch(`/usuarios/${usuario.id}`, dados);

  return resposta.data;
}
