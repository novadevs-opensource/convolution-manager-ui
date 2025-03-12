import * as THREE from 'three';
import { AvatarState } from './useAvatarState';
import { createAvatarMesh } from './three/createAvatarMesh';

export const AvatarBuilder = {
  buildAvatar: (state: AvatarState): THREE.Group => {
    // Actualmente solo se soporta el modelo "funko"
    return createAvatarMesh(state);
  }
};
