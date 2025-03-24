// src/components/characterEditor/CharacterDetailsSection.tsx
import React from 'react';
import { CharacterData } from '../../types';
import SplitTextArea from '../inputs/SplitTextArea';
import CharacterEditorSection from './CharacterEditorSection';

interface CharacterDetailsSectionProps {
  character: CharacterData;
  handleInputChange: (field: string, value: any) => void;
  forWizard?: boolean;
}

const CharacterDetailsSection: React.FC<CharacterDetailsSectionProps> = ({
  character,
  handleInputChange,
  forWizard = false,
}) => {
  return (
    <div className="grid sm:grid-cols-2 grid-row-1 gap-4">
      {/* Character Details */}
      {forWizard ? (
        <div>
          <SplitTextArea
            label='Bio'
            id="bio"
            placeholder="Write the character's biography... One sentence per line."
            value={character.bio}
            onChange={(newValue: string[]) => handleInputChange('bio', newValue)}
            splitOnBlur={true}
            className={'border-0 border-b-2 bg-white min-h-[140px]'}
            plain={true}
          />
          <SplitTextArea
            id="lore"
            label='Lore'
            placeholder="Describe the character's world, history... One sentence per line."
            value={character.lore}
            onChange={(newValue: string[]) => handleInputChange('lore', newValue)}
            splitOnBlur={true}
            className={'border-0 border-b-2 bg-white min-h-[140px]'}
            plain={true}
          />
          <SplitTextArea
            label='Topics'
            id="topics"
            placeholder="List topics... One sentence per line."
            value={character.topics}
            onChange={(newValue: string[]) => handleInputChange('topics', newValue)}
            splitOnBlur={true}
            className={'border-0 border-b-2 bg-white min-h-[140px]'}
            plain={true}
          />
        </div>
      ) : (
        <CharacterEditorSection
          title={'Character Details'}
          headerIcon={
            <button className="icon-button help-button" title="Define the character's biography, lore, and areas of knowledge">
              <i className="fa-solid fa-book"></i>
            </button>
          }
        >
          <SplitTextArea
            label='Bio'
            id="bio"
            placeholder="Write the character's biography... One sentence per line."
            value={character.bio}
            onChange={(newValue: string[]) => handleInputChange('bio', newValue)}
            splitOnBlur={true}
            plain={true}
          />
          <SplitTextArea
            id="lore"
            label='Lore'
            placeholder="Describe the character's world, history... One sentence per line."
            value={character.lore}
            onChange={(newValue: string[]) => handleInputChange('lore', newValue)}
            splitOnBlur={true}
            plain={true}
          />
          <SplitTextArea
            label='Topics'
            id="topics"
            placeholder="List topics... One sentence per line."
            value={character.topics}
            onChange={(newValue: string[]) => handleInputChange('topics', newValue)}
            splitOnBlur={true}
            plain={true}
          />
        </CharacterEditorSection>
      )}

      {/* Style */}
      {forWizard ? (
        <div>
          <SplitTextArea
            label='General Style'
            id="style-all"
            placeholder="Describe how the character communicates in general..."
            value={character.style?.all}
            onChange={(newValue: string[]) => handleInputChange('style.all', newValue)}
            splitOnBlur={true}
            className={'border-0 border-b-2 bg-white min-h-[140px]'}
            plain={true}
          />
          <SplitTextArea
            label='Chat Style'
            id="style-chat"
            placeholder="Describe chat-specific mannerisms..."
            value={character.style?.chat}
            onChange={(newValue: string[]) => handleInputChange('style.chat', newValue)}
            splitOnBlur={true}
            className={'border-0 border-b-2 bg-white min-h-[140px]'}
            plain={true}
          />
          <SplitTextArea
            label='Post Style'
            id="style-post"
            placeholder="Describe how the character writes posts..."
            value={character.style?.post}
            onChange={(newValue: string[]) => handleInputChange('style.post', newValue)}
            splitOnBlur={true}
            className={'border-0 border-b-2 bg-white min-h-[140px]'}
            plain={true}
          />
        </div>
      ) : (
        <CharacterEditorSection
          title={'Style'}
            headerIcon={
              <button className="icon-button help-button" title="Define the character's biography, lore, and areas of knowledge">
                <i className="fa-solid fa-book"></i>
              </button>
          }
        >
          <SplitTextArea
            label='General Style'
            id="style-all"
            placeholder="Describe how the character communicates in general..."
            value={character.style?.all}
            onChange={(newValue: string[]) => handleInputChange('style.all', newValue)}
            splitOnBlur={true}
            plain={true}
          />
          <SplitTextArea
            label='Chat Style'
            id="style-chat"
            placeholder="Describe chat-specific mannerisms..."
            value={character.style?.chat}
            onChange={(newValue: string[]) => handleInputChange('style.chat', newValue)}
            splitOnBlur={true}
            plain={true}
          />
          <SplitTextArea
            label='Post Style'
            id="style-post"
            placeholder="Describe how the character writes posts..."
            value={character.style?.post}
            onChange={(newValue: string[]) => handleInputChange('style.post', newValue)}
            splitOnBlur={true}
            plain={true}
          />
        </CharacterEditorSection>
      )}
    </div>
  );
};

export default CharacterDetailsSection;
