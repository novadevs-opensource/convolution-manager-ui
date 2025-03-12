import * as THREE from 'three';
import { AvatarState } from '../useAvatarState';
import { addHairStyle } from '../three/parts/hair';
import { addAccessory } from '../three/parts/accessories';

export interface AttachmentPoints {
  head?: THREE.Object3D;
  body?: THREE.Object3D;
  leftHand?: THREE.Object3D;
  rightHand?: THREE.Object3D;
}

export class AvatarAttachmentManager {
  private avatar: THREE.Group;
  private attachmentPoints: AttachmentPoints = {};
  private attachments: THREE.Group = new THREE.Group();
  private state: AvatarState;
  // Valor de referencia (la altura del modelo Funko para el que se diseñaron los attachments)
  private readonly referenceHeight: number = 4; 

  constructor(avatar: THREE.Group, state: AvatarState) {
    this.avatar = avatar;
    this.state = state;
    
    // Crear un grupo para los attachments y agregarlo al avatar
    this.attachments.name = 'attachments';
    this.avatar.add(this.attachments);
    
    // Detectar puntos de anclaje (si el modelo no tiene nombres convencionales, se crea uno por defecto)
    this.detectAttachmentPoints();
  }

  // Recorre la jerarquía del avatar buscando nodos con nombres indicativos
  private detectAttachmentPoints(): void {
    this.avatar.traverse((object) => {
      const name = object.name.toLowerCase();
      if (name.includes('head') || name.includes('cabeza')) {
        this.attachmentPoints.head = object;
      } else if (name.includes('body') || name.includes('torso') || name.includes('cuerpo')) {
        this.attachmentPoints.body = object;
      } else if (name.includes('hand_l') || name.includes('mano_izq')) {
        this.attachmentPoints.leftHand = object;
      } else if (name.includes('hand_r') || name.includes('mano_der')) {
        this.attachmentPoints.rightHand = object;
      }
    });
    
    // Si no se detecta un punto para la cabeza, se crea uno basado en el bounding box del avatar
    if (!this.attachmentPoints.head) {
      const headPoint = new THREE.Object3D();
      headPoint.name = 'attachment_head';
      const box = new THREE.Box3().setFromObject(this.avatar);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      headPoint.position.set(center.x, center.y + size.y * 0.4, center.z);
      this.avatar.add(headPoint);
      this.attachmentPoints.head = headPoint;
    }
    
    console.log('Attachment Points detectados:', this.attachmentPoints);
  }

  // Se llama cada vez que cambia el estado para actualizar los attachments
  public updateAttachments(newState: AvatarState): void {
    this.state = newState;
    
    // Eliminar attachments anteriores
    while (this.attachments.children.length > 0) {
      this.attachments.remove(this.attachments.children[0]);
    }
    
    // Añadir de nuevo pelo y accesorios
    this.addAllAttachments();
  }

  private addAllAttachments(): void {
    if (this.attachmentPoints.head) {
      this.addHair();
      this.addAccessories();
    }
  }

  private addHair(): void {
    if (!this.attachmentPoints.head) return;
    
    const hairGroup = new THREE.Group();
    hairGroup.name = 'hair';
    
    // Material para el pelo creado a partir del color del estado
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.state.hairColor),
      roughness: 0.3,
      metalness: 0.1
    });
    
    // Agrega la geometría del pelo según el estilo (esta función debe encargarse de ajustar su propia geometría)
    addHairStyle(hairGroup, this.state, hairMaterial);
    
    // Autoajustar la escala: se toma el tamaño global del avatar y se compara con el valor de referencia
    this.scaleAndPositionAttachment(hairGroup);
    
    this.attachments.add(hairGroup);
    // Posicionar el pelo en el punto de anclaje de la cabeza
    hairGroup.position.copy(this.attachmentPoints.head.position);
    hairGroup.position.y += 0.1;
  }

  private addAccessories(): void {
    if (!this.attachmentPoints.head) return;
    if (this.state.accessory === 'none') return;
    
    const accessoryGroup = new THREE.Group();
    accessoryGroup.name = 'accessory';
    
    // Material para los accesorios (se puede modificar para que dependa de outfitColor u otra propiedad)
    const accessoryMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#222222'),
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Invocar la función externa que agrega el accesorio; se pasa el material para que se use en la creación
    addAccessory(accessoryGroup, this.state, accessoryMaterial);
    
    this.scaleAndPositionAttachment(accessoryGroup);
    this.attachments.add(accessoryGroup);
    accessoryGroup.position.copy(this.attachmentPoints.head.position);
    
    // Offsets para posicionar bien según el tipo de accesorio
    if (this.state.accessory === 'glasses') {
      accessoryGroup.position.z += 0.3;
    } else if (this.state.accessory === 'hat') {
      accessoryGroup.position.y += 0.3;
    }
  }
  
  // Calcula la escala de los attachments en función de la altura global del avatar comparada con el modelo de referencia
  private scaleAndPositionAttachment(attachment: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(this.avatar);
    const modelHeight = box.getSize(new THREE.Vector3()).y;
    const scaleFactor = modelHeight / this.referenceHeight;
    attachment.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }
}
