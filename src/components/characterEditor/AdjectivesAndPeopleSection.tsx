// src/components/characterEditor/AdjectivesAndPeopleSection.tsx
import React from 'react';

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
      <section className="section">
        <div className="section-header">
          <span>Adjectives</span>
          <button className="icon-button help-button" title="Add single-word traits that describe the character">
            <i className="fa-solid fa-tags"></i>
          </button>
        </div>
        <div className="section-content">
          <div className="form-group">
            <div className="adjectives-header">
              <label>Character Adjectives</label>
              <button
                id="add-adjective"
                className="action-button add-button"
                title="Add Adjective"
                onClick={handleAddAdjective}
              >
                +
              </button>
            </div>
            <div id="adjectives-container">
              {adjectives.map((adj, index) => (
                <div key={index} className="adjective-entry">
                  <input
                    type="text"
                    className="adjective-name"
                    placeholder="Enter an adjective"
                    value={adj}
                    onChange={(e) => handleAdjectiveChange(index, e.target.value)}
                  />
                  <button
                    className="action-button delete-button"
                    title="Remove Adjective"
                    onClick={() => handleRemoveAdjective(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span>People</span>
          <button className="icon-button help-button" title="Add people that the character knows or has relationships with">
            <i className="fa-solid fa-user-group"></i>
          </button>
        </div>
        <div className="section-content">
          <div className="form-group">
            <div className="people-header">
              <label>Known People</label>
              <button
                id="add-person"
                className="action-button add-button"
                title="Add Person"
                onClick={handleAddPerson}
              >
                +
              </button>
            </div>
            <div id="people-container">
              {people.map((person, index) => (
                <div key={index} className="person-entry">
                  <input
                    type="text"
                    className="person-name"
                    placeholder="Enter person's name"
                    value={person}
                    onChange={(e) => handlePersonChange(index, e.target.value)}
                  />
                  <button
                    className="action-button delete-button"
                    title="Remove Person"
                    onClick={() => handleRemovePerson(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdjectivesAndPeopleSection;
