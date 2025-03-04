// src/components/characterEditor/AdjectivesAndPeopleSection.tsx
import React from 'react';
import CharacterEditorSection from './CharacterEditorSection';
import FormGroup from '../common/FormGroup';
import GenericTextInput from '../inputs/GenericTextInput';

interface AdjectivesAndPeopleSectionProps {
  adjectives?: string[];
  people?: string[];
  onAdjectivesChange: (newAdjectives: string[]) => void;
  onPeopleChange: (newPeople: string[]) => void;
}

const AdjectivesAndPeopleSection: React.FC<AdjectivesAndPeopleSectionProps> = ({
  adjectives = [],
  people = [],
  onAdjectivesChange,
  onPeopleChange,
}) => {
  const handleAddAdjective = () => {
    onAdjectivesChange([...adjectives, '']);
  };

  const handleAdjectiveChange = (index: number, value: string) => {
    const updated = adjectives.map((adj, i) => (i === index ? value : adj));
    onAdjectivesChange(updated);
  };

  const handleRemoveAdjective = (index: number) => {
    const updated = adjectives.filter((_, i) => i !== index);
    onAdjectivesChange(updated);
  };

  const handleAddPerson = () => {
    onPeopleChange([...people, '']);
  };

  const handlePersonChange = (index: number, value: string) => {
    const updated = people.map((person, i) => (i === index ? value : person));
    onPeopleChange(updated);
  };

  const handleRemovePerson = (index: number) => {
    const updated = people.filter((_, i) => i !== index);
    onPeopleChange(updated);
  };

  return (
    <div className="two-columns">
      <CharacterEditorSection
        title={'Adjectives'}
        headerIcon={
          <button className="icon-button help-button" title="Add single-word traits that describe the character">
            <i className="fa-solid fa-tags"></i>
          </button>
        }
      >
        <FormGroup>
            <div className="adjectives-header">
              <label>Character Adjectives</label>
              <button
                id="add-adjective"
                className="action-button add-button border-gray-300"
                title="Add Adjective"
                onClick={handleAddAdjective}
              >
                <i className='fa fa-plus'></i>
              </button>
            </div>
            <div id="adjectives-container">
              {adjectives.map((adj, index) => (
                <div key={index} className="adjective-entry">
                  <GenericTextInput
                    plain={true}
                    placeholder="Enter an adjective"
                    value={adj}
                    onChange={(e) => handleAdjectiveChange(index, e.target.value)}
                  />
                  <button
                    className="action-button delete-button border-gray-300"
                    title="Remove Adjective"
                    onClick={() => handleRemoveAdjective(index)}
                  >
                    <i className='fa fa-trash'></i>
                  </button>
                </div>
              ))}
            </div>
        </FormGroup>
      </CharacterEditorSection>

      <CharacterEditorSection
        title={'People'}
        headerIcon={
          <button className="icon-button help-button" title="Add people that the character knows or has relationships with">
            <i className="fa-solid fa-user-group"></i>
          </button>
        }
      >
        <FormGroup>
            <div className="people-header">
              <label>Known People</label>
              <button
                id="add-person"
                className="action-button add-button border-gray-300"
                title="Add Person"
                onClick={handleAddPerson}
              >
                <i className='fa fa-plus'></i>
              </button>
            </div>
            <div id="people-container">
              {people.map((person, index) => (
                <div key={index} className="person-entry">
                  <GenericTextInput
                    plain={true}
                    placeholder="Enter person's name"
                    className="person-name"
                    value={person}
                    onChange={(e) => handlePersonChange(index, e.target.value)}
                  />
                  <button
                    className="action-button delete-button border-gray-300"
                    title="Remove Person"
                    onClick={() => handleRemovePerson(index)}
                  >
                    <i className='fa fa-trash'></i>
                  </button>
                </div>
              ))}
            </div>
        </FormGroup>
      </CharacterEditorSection>
    </div>
  );
};

export default AdjectivesAndPeopleSection;
