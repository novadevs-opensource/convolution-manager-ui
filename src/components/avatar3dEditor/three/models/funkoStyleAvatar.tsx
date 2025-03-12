import * as THREE from 'three';
import { AvatarState } from '../../useAvatarState';
import { createBasicMaterials } from '../createAvatarMaterials';
import { addHairStyle } from '../parts/hair';
import { addAccessory } from '../parts/accessories';

export const createFunkoStyleAvatar = (
  avatar: THREE.Group, 
  state: AvatarState,
  materials: ReturnType<typeof createBasicMaterials>
): void => {
  // Cabeza estilo Funko con esquinas redondeadas
  const headGeometry = new THREE.BoxGeometry(2, 2, 2);
  const edgeRadius = 0.2;
  for (let i = 0; i < headGeometry.attributes.position.count; i++) {
    const x = headGeometry.attributes.position.getX(i);
    const y = headGeometry.attributes.position.getY(i);
    const z = headGeometry.attributes.position.getZ(i);
    const distance = Math.sqrt(x * x + y * y + z * z);
    if (distance > 1.0) {
      const direction = new THREE.Vector3(x, y, z).normalize();
      const newDistance = Math.min(distance, Math.sqrt(3) - edgeRadius);
      headGeometry.attributes.position.setXYZ(i, direction.x * newDistance, direction.y * newDistance, direction.z * newDistance);
    }
  }
  headGeometry.computeVertexNormals();

  const head = new THREE.Mesh(headGeometry, materials.skin);
  head.position.y = 1;
  avatar.add(head);

  // Cuerpo pequeño estilo Funko
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 1.8, 16), materials.outfit);
  body.position.y = -0.9;
  avatar.add(body);

  // Ojos grandes
  const createEye = (xPos: number): THREE.Group => {
    const eyeGroup = new THREE.Group();
    const eyeOuter = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), new THREE.MeshBasicMaterial({ color: '#FFF' }));
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(state.eyeColor) }));
    iris.position.z = 0.15;
    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    highlight.position.set(0.07, 0.07, 0.25);
    eyeGroup.add(eyeOuter, iris, highlight);
    eyeGroup.position.set(xPos, 1.2, 0.85);
    if(state.expression === 'happy') eyeGroup.position.y += 0.1;
    else if(state.expression === 'sad') eyeGroup.position.y -= 0.1;
    else if(state.expression === 'angry') eyeGroup.rotation.z = xPos > 0 ? 0.2 : -0.2;
    return eyeGroup;
  };
  avatar.add(createEye(-0.5), createEye(0.5));

  // Nariz pequeña
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), materials.skin);
  nose.position.set(0, 0.9, 1.05);
  nose.scale.set(1, 0.8, 0.5);
  avatar.add(nose);

  // Boca según expresión
  addFunkoMouth(avatar, state.expression);

  // Pelo y accesorios
  addHairStyle(avatar, state, materials.hair);
  addAccessory(avatar, state, materials.hair);

  // Brazos y piernas
  addFunkoArms(avatar, materials);
  addFunkoLegs(avatar);

  // Detalles de la ropa
  addOutfitDetails(avatar, state.outfitStyle, materials.outfit);
};

// Función para la boca
const addFunkoMouth = (avatar: THREE.Group, expression: string): void => {
  let mouth: THREE.Mesh;
  if(expression === 'neutral'){
    mouth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    mouth.position.set(0, 0.6, 1);
  } else if(expression === 'happy'){
    mouth = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 16, 16, Math.PI), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    mouth.rotation.z = Math.PI;
    mouth.position.set(0, 0.6, 1);
  } else if(expression === 'sad'){
    mouth = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 16, 16, Math.PI), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    mouth.position.set(0, 0.6, 1);
  } else if(expression === 'angry'){
    mouth = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    mouth.position.set(0, 0.55, 1);
  } else {
    mouth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    mouth.position.set(0, 0.6, 1);
  }
  avatar.add(mouth);
};

const addFunkoArms = (avatar: THREE.Group, materials: any): void => {
  const createArm = (side: number): THREE.Object3D => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.2, 16), materials.outfit);
    arm.position.set(side * 1.1, -0.9, 0);
    arm.rotation.z = side * 0.2;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), materials.skin);
    hand.position.y = -0.6;
    arm.add(hand);
    return arm;
  };
  avatar.add(createArm(-1), createArm(1));
};

const addFunkoLegs = (avatar: THREE.Group): void => {
  const createLeg = (side: number): THREE.Object3D => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1, 16), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    leg.position.set(side * 0.4, -2.3, 0);
    return leg;
  };
  avatar.add(createLeg(-1), createLeg(1));
};

const addOutfitDetails = (avatar: THREE.Group, outfitStyle: string, outfitMat: THREE.Material): void => {
  if(outfitStyle === 'casual'){
    const tshirt = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.4), outfitMat);
    tshirt.position.set(0, -0.3, 0.7);
    avatar.add(tshirt);
  } else if(outfitStyle === 'formal'){
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.1), outfitMat);
    tie.position.set(0, -0.6, 0.8);
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.3), outfitMat);
    shirt.position.set(0, -0.3, 0.75);
    avatar.add(tie, shirt);
  } else if(outfitStyle === 'uniform'){
    const collar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 0.3), outfitMat);
    collar.position.set(0, -0.2, 0.75);
    const badge = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), new THREE.MeshStandardMaterial({ color: 0xffff00 }));
    badge.position.set(0.6, -0.6, 0.8);
    badge.rotation.y = Math.PI / 2;
    avatar.add(collar, badge);
  }
};
