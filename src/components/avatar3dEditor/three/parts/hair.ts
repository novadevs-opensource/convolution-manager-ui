import * as THREE from 'three';
import { AvatarState } from '../../useAvatarState';

// Función para añadir pelo según el estilo Funko
export const addHairStyle = (avatar: THREE.Group, state: AvatarState, hairMat: THREE.Material): void => {
  if (state.hairStyle === 'short') {
    addFunkoShortHair(avatar, hairMat);
  } else if (state.hairStyle === 'long') {
    // Para el estilo "long", usamos un look afro con mayor volumen
    addFunkoAfroHair(avatar, hairMat);
  } else if (state.hairStyle === 'ponytail') {
    addFunkoPonytail(avatar, hairMat);
  } else if (state.hairStyle === 'pigtails') {
    addFunkoPigtails(avatar, hairMat);
  }
};

const createHairCap = (hairMat: THREE.Material, capAngle: number, headTopY: number): THREE.Group => {
  const domeGeometry = new THREE.SphereGeometry(1.05, 32, 32, 0, Math.PI * 2, 0, capAngle);
  const dome = new THREE.Mesh(domeGeometry, hairMat);
  dome.rotation.x = Math.PI;
  dome.position.y = headTopY;
  const baseGeometry = new THREE.CylinderGeometry(1.05, 1.05, 0.2, 32);
  const base = new THREE.Mesh(baseGeometry, hairMat);
  base.position.y = headTopY - 0.1;
  const cap = new THREE.Group();
  cap.add(dome, base);
  return cap;
};

const addFunkoShortHair = (avatar: THREE.Group, hairMat: THREE.Material): void => {
  // Pelo corto: tapa tipo domo de ángulo π/2
  const cap = createHairCap(hairMat, Math.PI / 2, 2.0);
  avatar.add(cap);
};

const addFunkoAfroHair = (avatar: THREE.Group, hairMat: THREE.Material): void => {
  // Pelo afro: tapa con mayor ángulo para mayor volumen
  const cap = createHairCap(hairMat, Math.PI * 0.85, 2.0);
  avatar.add(cap);
};

const addFunkoPonytail = (avatar: THREE.Group, hairMat: THREE.Material): void => {
  // Primero la tapa
  const cap = createHairCap(hairMat, Math.PI / 2, 2.0);
  avatar.add(cap);
  // Coleta con TubeGeometry
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.0 - 0.2, 0),
    new THREE.Vector3(0, 2.0 - 0.7, -0.5),
    new THREE.Vector3(0, 2.0 - 1.5, -0.8),
    new THREE.Vector3(0, 2.0 - 2.0, -0.9)
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.25, 16, false);
  const ponytail = new THREE.Mesh(tubeGeo, hairMat);
  const base = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), hairMat);
  base.position.copy(curve.getPoint(0));
  const group = new THREE.Group();
  group.add(ponytail, base);
  avatar.add(group);
};

const addFunkoPigtails = (avatar: THREE.Group, hairMat: THREE.Material): void => {
  const cap = createHairCap(hairMat, Math.PI / 2, 2.0);
  avatar.add(cap);
  const createPigtail = (side: number) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.8, 2.0 - 0.2, 0),
      new THREE.Vector3(side * 0.9, 2.0 - 0.8, side * 0.1),
      new THREE.Vector3(side * 1.0, 2.0 - 1.4, 0),
      new THREE.Vector3(side * 0.9, 2.0 - 1.8, -side * 0.1)
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.2, 16, false);
    const pigtail = new THREE.Mesh(tubeGeo, hairMat);
    const base = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), hairMat);
    base.position.copy(curve.getPoint(0));
    return [pigtail, base];
  };
  const [leftPt, leftBase] = createPigtail(-1);
  const [rightPt, rightBase] = createPigtail(1);
  const group = new THREE.Group();
  group.add(leftPt, leftBase, rightPt, rightBase);
  avatar.add(group);
};
