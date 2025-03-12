import * as THREE from 'three';
import { AvatarState } from '../useAvatarState';

export const createBasicMaterials = (state: AvatarState) => {
  return {
    skin: new THREE.MeshStandardMaterial({ color: state.skinColor }),
    outfit: new THREE.MeshStandardMaterial({ color: state.outfitColor }),
    hair: new THREE.MeshStandardMaterial({ color: state.hairColor }),
  };
};
