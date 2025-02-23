// src/components/characterEditor/CharacterDetailsSection.tsx
import React from 'react';
import { CharacterData } from '../../types';
import SplitTextArea from '../inputs/SplitTextArea';

interface CharacterDetailsSectionProps {
  character: CharacterData;
  handleInputChange: (field: string, value: any) => void;
}

const CharacterDetailsSection: React.FC<CharacterDetailsSectionProps> = ({
  character,
  handleInputChange,
}) => {
  return (
    <div className="two-columns">
      {/* Character Details */}
      <section className="section">
        <div className="section-header">
          <span>Character Details</span>
          <button className="icon-button help-button" title="Define the character's biography, lore, and areas of knowledge">
            <i className="fa-solid fa-book"></i>
          </button>
        </div>
        <div className="section-content">
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <SplitTextArea
              id="bio"
              placeholder="Write the character's biography... One sentence per line."
              value={character.bio}
              onChange={(newValue: string[]) => handleInputChange('bio', newValue)}
              splitOnBlur={true}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lore">Lore</label>
            <SplitTextArea
              id="lore"
              placeholder="Describe the character's world, history... One sentence per line."
              value={character.lore}
              onChange={(newValue: string[]) => handleInputChange('lore', newValue)}
              splitOnBlur={true}
            />
          </div>
          <div className="form-group">
            <label htmlFor="topics">Topics</label>
            <SplitTextArea
              id="topics"
              placeholder="List topics... One sentence per line."
              value={character.topics}
              onChange={(newValue: string[]) => handleInputChange('topics', newValue)}
              splitOnBlur={true}
            />
          </div>
        </div>
      </section>

      {/* Style */}
      <section className="section">
        <div className="section-header">
          <span>Style</span>
          <button className="icon-button help-button" title="Set how the character communicates in different contexts">
            <i className="fa-solid fa-pen-fancy"></i>
          </button>
        </div>
        <div className="section-content">
          <div className="form-group">
            <label htmlFor="style-all">General Style</label>
            <SplitTextArea
              id="style-all"
              placeholder="Describe how the character communicates in general..."
              value={character.style?.all}
              onChange={(newValue: string[]) => handleInputChange('style.all', newValue)}
              splitOnBlur={true}
            />
          </div>
          <div className="form-group">
            <label htmlFor="style-chat">Chat Style</label>
            <SplitTextArea
              id="style-chat"
              placeholder="Describe chat-specific mannerisms..."
              value={character.style?.chat}
              onChange={(newValue: string[]) => handleInputChange('style.chat', newValue)}
              splitOnBlur={true}
            />
          </div>
          <div className="form-group">
            <label htmlFor="style-post">Post Style</label>
            <SplitTextArea
              id="style-post"
              placeholder="Describe how the character writes posts..."
              value={character.style?.post}
              onChange={(newValue: string[]) => handleInputChange('style.post', newValue)}
              splitOnBlur={true}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CharacterDetailsSection;
