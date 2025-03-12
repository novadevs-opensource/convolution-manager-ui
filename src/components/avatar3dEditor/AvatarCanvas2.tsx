// AvatarCanvas.tsx
import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { AvatarStateContextType } from './useAvatarState';
import { AvatarBuilder } from './AvatarBuilder';
import GLBImporter from './importers/GLBImporter';
import { AvatarAttachmentManager } from './attachments/AvatarAttachments';

interface AvatarCanvasProps {
  avatarState: AvatarStateContextType;
  builder: typeof AvatarBuilder;
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({ avatarState, builder }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarRef = useRef<THREE.Group | null>(null);
  const attachmentManagerRef = useRef<AvatarAttachmentManager | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [prevMousePos, setPrevMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cameraZ, setCameraZ] = useState<number>(5);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImported, setIsImported] = useState<boolean>(false);

  const renderScene = () => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  // Inicialización de la escena (solo se ejecuta una vez)
  useEffect(() => {
    if (!mountRef.current) return;

    // Limpiar contenedor
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    const width = mountRef.current.clientWidth;
    const height = 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2d2d2d);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, cameraZ);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Iluminación
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(1, 1, 1);
    scene.add(directional);
    // <-- Corrección: crear y agregar el PointLight por separado
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(2, 0, 3);
    scene.add(pointLight);

    // Si aún no se importó ningún modelo, creamos el avatar por defecto
    if (!isImported) {
      createAvatar();
    }

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = 500;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      renderScene();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []); // Se ejecuta una sola vez

  // Actualización del avatar o de sus accesorios
  useEffect(() => {
    if (isImported && attachmentManagerRef.current) {
      // Actualizar los attachments del modelo importado
      attachmentManagerRef.current.updateAttachments(avatarState);
      renderScene();
    } else {
      // Reconstruir el avatar por defecto
      createAvatar();
    }
  }, [
    avatarState.baseModel,
    avatarState.hairStyle,
    avatarState.hairColor,
    avatarState.eyeColor,
    avatarState.skinColor,
    avatarState.outfitStyle,
    avatarState.outfitColor,
    avatarState.accessory,
    avatarState.expression
    // Notar que no incluimos cameraZ ni zoom
  ]);

  // Función para crear el avatar por defecto
  const createAvatar = () => {
    if (!sceneRef.current) return;
    // Si ya existe un modelo importado, no reconstruir
    if (isImported && avatarRef.current) {
      renderScene();
      return;
    }
    if (avatarRef.current) {
      sceneRef.current.remove(avatarRef.current);
      avatarRef.current = null;
    }
    const avatar = builder.buildAvatar(avatarState);
    avatar.position.y = avatarState.baseModel === 'funko' ? 0 : 0.5;
    avatarRef.current = avatar;
    sceneRef.current.add(avatar);
    renderScene();
  };

  // Manejo de importación GLB
  const handleModelImported = (gltf: GLTF) => {
    if (!sceneRef.current) return;
    try {
      // Remover avatar anterior (si existe)
      if (avatarRef.current) {
        sceneRef.current.remove(avatarRef.current);
        avatarRef.current = null;
      }
      const importedModel = gltf.scene;
      const avatarGroup = new THREE.Group();
      avatarGroup.add(importedModel);

      // Centrar y escalar el modelo importado
      const box = new THREE.Box3().setFromObject(importedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      importedModel.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim;
      avatarGroup.scale.set(scale, scale, scale);

      avatarRef.current = avatarGroup;
      sceneRef.current.add(avatarGroup);
      setIsImported(true);
      setImportError(null);

      // Crear y actualizar el AttachmentManager para el modelo importado
      attachmentManagerRef.current = new AvatarAttachmentManager(avatarGroup, avatarState);
      attachmentManagerRef.current.updateAttachments(avatarState);

      renderScene();
    } catch (error) {
      console.error(error);
      setImportError('Error al procesar el modelo importado.');
    }
  };

  const handleImportError = (error: Error) => {
    console.error(error);
    setImportError(error.message);
  };

  const handleBackToEditor = () => {
    setIsImported(false);
    createAvatar();
  };

  // Eventos de interacción (rotación y zoom)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setPrevMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && avatarRef.current) {
      const delta = { x: e.clientX - prevMousePos.x, y: e.clientY - prevMousePos.y };
      avatarRef.current.rotation.y += delta.x * 0.01;
      avatarRef.current.rotation.x += delta.y * 0.01;
      setPrevMousePos({ x: e.clientX, y: e.clientY });
      renderScene();
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const newZoom = cameraZ + (e.deltaY > 0 ? zoomSpeed : -zoomSpeed);
    const clamped = Math.min(Math.max(newZoom, 2), 10);
    setCameraZ(clamped);
    if (cameraRef.current) {
      cameraRef.current.position.z = clamped;
      renderScene();
    }
  };

  useEffect(() => {
    const current = mountRef.current;
    if (!current) return;
    current.addEventListener('wheel', handleWheel as any, { passive: false });
    return () => current.removeEventListener('wheel', handleWheel as any);
  }, [cameraZ]);

  return (
    <div className="w-full md:w-2/3 bg-gray-100 rounded-lg p-2">
      <div className="mb-4">
        <GLBImporter onModelImported={handleModelImported} onImportError={handleImportError} />
        {importError && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            {importError}
          </div>
        )}
        {isImported && (
          <div className="mt-2 flex justify-center">
            <button 
              onClick={handleBackToEditor}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
            >
              Volver al editor
            </button>
            <div className="ml-2 p-2 bg-blue-100 text-blue-700 rounded text-sm">
              Modo importado: solo se pueden modificar accesorios y pelo.
            </div>
          </div>
        )}
      </div>
      <div 
        ref={mountRef}
        className="w-full border border-gray-300 rounded-lg cursor-move bg-gray-800"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      ></div>
    </div>
  );
};
