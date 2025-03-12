import * as THREE from 'three';
import { AvatarState } from '../useAvatarState';

import { createFunkoStyleAvatar } from './models/funkoStyleAvatar';
import { createBasicMaterials } from './createAvatarMaterials';

export const createAvatarMesh = (state: AvatarState): THREE.Group => {
  const materials = createBasicMaterials(state);
  const avatar = new THREE.Group();

  // Actualmente solo se soporta el modelo Funko
  createFunkoStyleAvatar(avatar, state, materials);
  return avatar;
};
