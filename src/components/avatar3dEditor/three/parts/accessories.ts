import * as THREE from 'three';
import { AvatarState } from '../../useAvatarState';

// Función principal que decide qué accesorio agregar, usando el material que se pasa
export const addAccessory = (avatar: THREE.Group, avatarState: AvatarState, material: THREE.Material): void => {
  if (avatarState.accessory === 'none') return;
  
  if (avatarState.accessory === 'glasses') {
    addFunkoGlasses(avatar, material);
  } else if (avatarState.accessory === 'hat') {
    addFunkoHat(avatar, material);
  } else if (avatarState.accessory === 'bow') {
    addFunkoBow(avatar, material);
  }
};

const addFunkoGlasses = (avatar: THREE.Group, material: THREE.Material): void => {
  const glasses = new THREE.Group();
  
  // Usamos el material pasado para los elementos del accesorio
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.1, 0.1),
    material
  );
  
  const leftLens = new THREE.Mesh(
    new THREE.RingGeometry(0.25, 0.35, 16),
    material
  );
  leftLens.position.set(-0.4, 0, 0.05);
  
  const rightLens = new THREE.Mesh(
    new THREE.RingGeometry(0.25, 0.35, 16),
    material
  );
  rightLens.position.set(0.4, 0, 0.05);
  
  glasses.add(frame, leftLens, rightLens);
  glasses.scale.set(0.5, 0.5, 0.5);
  glasses.position.set(0, 1.45, -0.4);
  avatar.add(glasses);
};

const addFunkoHat = (avatar: THREE.Group, material: THREE.Material): void => {
  const hat = new THREE.Group();
  
  const hatBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 0.2, 32),
    material
  );
  hatBase.position.y = 2.3;
  
  const hatTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.7, 0.8, 32),
    material
  );
  hatTop.position.y = 2.8;
  
  hat.add(hatBase, hatTop);
  hat.scale.set(0.5, 0.5, 0.5);
  hat.position.set(0, 0, -0.15);
  avatar.add(hat);
};

const addFunkoBow = (avatar: THREE.Group, material: THREE.Material): void => {
  const bow = new THREE.Group();
  
  const bowCenter = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.1),
    material
  );
  
  const bowLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.1),
    material
  );
  bowLeft.position.x = -0.3;
  bowLeft.rotation.z = -0.3;
  
  const bowRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.1),
    material
  );
  bowRight.position.x = 0.3;
  bowRight.rotation.z = 0.3;
  
  bow.add(bowCenter, bowLeft, bowRight);
  bow.position.set(0, 2.2, 0);
  avatar.add(bow);
};
