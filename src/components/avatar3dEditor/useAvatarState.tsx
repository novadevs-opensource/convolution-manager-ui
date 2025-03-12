import { useState } from 'react';

export type BaseModelType = 'funko';
export type HairStyleType = 'long' | 'short' | 'ponytail' | 'pigtails';
export type OutfitStyleType = 'casual' | 'formal' | 'uniform';
export type AccessoryType = 'none' | 'glasses' | 'hat' | 'bow';
export type ExpressionType = 'neutral' | 'happy' | 'sad' | 'angry';

export interface AvatarState {
  baseModel: BaseModelType;
  hairStyle: HairStyleType;
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  outfitStyle: OutfitStyleType;
  outfitColor: string;
  accessory: AccessoryType;
  expression: ExpressionType;
}

export interface AvatarStateContextType extends AvatarState {
  updateState: <K extends keyof AvatarState>(key: K, value: AvatarState[K]) => void;
}

export const useAvatarState = (): AvatarStateContextType => {
  const [baseModel, setBaseModel] = useState<BaseModelType>('funko');
  const [hairStyle, setHairStyle] = useState<HairStyleType>('long');
  const [hairColor, setHairColor] = useState<string>('#000000');
  const [eyeColor, setEyeColor] = useState<string>('#6C88E5');
  const [skinColor, setSkinColor] = useState<string>('#F7D7C5');
  const [outfitStyle, setOutfitStyle] = useState<OutfitStyleType>('casual');
  const [outfitColor, setOutfitColor] = useState<string>('#3366CC');
  const [accessory, setAccessory] = useState<AccessoryType>('none');
  const [expression, setExpression] = useState<ExpressionType>('neutral');

  const updateState = <K extends keyof AvatarState>(key: K, value: AvatarState[K]): void => {
    switch (key) {
      case 'baseModel': setBaseModel(value as BaseModelType); break;
      case 'hairStyle': setHairStyle(value as HairStyleType); break;
      case 'hairColor': setHairColor(value as string); break;
      case 'eyeColor': setEyeColor(value as string); break;
      case 'skinColor': setSkinColor(value as string); break;
      case 'outfitStyle': setOutfitStyle(value as OutfitStyleType); break;
      case 'outfitColor': setOutfitColor(value as string); break;
      case 'accessory': setAccessory(value as AccessoryType); break;
      case 'expression': setExpression(value as ExpressionType); break;
    }
  };

  return {
    baseModel,
    hairStyle,
    hairColor,
    eyeColor,
    skinColor,
    outfitStyle,
    outfitColor,
    accessory,
    expression,
    updateState
  };
};
