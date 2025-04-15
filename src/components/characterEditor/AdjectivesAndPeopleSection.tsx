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
  forWizard?: boolean;
}

const AdjectivesAndPeopleSection: React.FC<AdjectivesAndPeopleSectionProps> = ({
  adjectives = [],
  people = [],
  onAdjectivesChange,
  onPeopleChange,
  forWizard,
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
    <div className="grid sm:grid-cols-2 grid-row-1 gap-4">
      {forWizard ? (
        <>
            <FormGroup className='bg-gray-50 p-4 rounded-lg'>
                <div className="adjectives-header">
                  <h3 className='text-lg font-bold font-anek-latin'>Character Adjectives</h3>
                  <button
                    id="add-adjective"
                    className="w-10 h-10 bg-yellow-500 border-yellow-500 hover:bg-black hover:text-white rounded-full border hover:border-black boder-yellow-500 border-2"
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
                        className="w-11 h-10 bg-yellow-500 hover:bg-black hover:text-white rounded-full border border-yellow-500 hover:border-black border-2"
                        title="Remove Adjective"
                        onClick={() => handleRemoveAdjective(index)}
                      >
                        <i className='fa fa-trash'></i>
                      </button>
                    </div>
                  ))}
                </div>
            </FormGroup>

            <FormGroup className='bg-gray-50 p-3 rounded-lg'>
                <div className="people-header">
                  <h3 className='text-lg font-bold font-anek-latin'>Known People</h3>
                  <button
                    id="add-person"
                    className="w-10 h-10 bg-yellow-500 border-yellow-500 hover:bg-black hover:text-white rounded-full border hover:border-black border-2"
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
                        className="w-11 h-10 bg-yellow-500 border-yellow-500 hover:bg-black hover:text-white rounded-full border hover:border-black border-2"
                        title="Remove Person"
                        onClick={() => handleRemovePerson(index)}
                      >
                        <i className='fa fa-trash'></i>
                      </button>
                    </div>
                  ))}
                </div>
            </FormGroup>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default AdjectivesAndPeopleSection;
