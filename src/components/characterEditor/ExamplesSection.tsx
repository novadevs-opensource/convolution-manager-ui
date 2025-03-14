// src/components/characterEditor/ExamplesSection.tsx
import React from 'react';
import { MessageExample } from '../../types';
import SplitTextArea from '../inputs/SplitTextArea';
import CharacterEditorSection from './CharacterEditorSection';
import FormGroup from '../common/FormGroup';
import GenericTextArea from '../inputs/GenericTextArea';

interface ExamplesSectionProps {
  messageExamples: MessageExample[][];
  postExamples: string[];
  characterName: string;
  onMessageExamplesChange: (examples: MessageExample[][]) => void;
  onPostExamplesChange: (posts: string[]) => void;
}

const ExamplesSection: React.FC<ExamplesSectionProps> = ({
  messageExamples,
  postExamples,
  characterName,
  onMessageExamplesChange,
  onPostExamplesChange,
}) => {
  // Agregar un nuevo ejemplo (conversación) usando el valor de characterName para el mensaje del personaje
  const handleAddExample = () => {
    const newExample: MessageExample[] = [
      { user: "{{user1}}", content: { text: "" } },
      { user: characterName || "character", content: { text: "" } },
    ];
    onMessageExamplesChange([...messageExamples, newExample]);
  };

  // Elimina un ejemplo según su índice
  const handleRemoveExample = (index: number) => {
    const updated = messageExamples.filter((_, i) => i !== index);
    onMessageExamplesChange(updated);
  };

  // Actualiza el mensaje del usuario (primer mensaje) de un ejemplo específico
  const handleUserMessageChange = (exampleIndex: number, value: string) => {
    const updated = messageExamples.map((example, i) => {
      if (i === exampleIndex) {
        const newExample = [...example];
        newExample[0] = { ...newExample[0], content: { text: value } };
        return newExample;
      }
      return example;
    });
    onMessageExamplesChange(updated);
  };

  // Actualiza la respuesta del personaje (segundo mensaje) de un ejemplo específico
  const handleCharacterMessageChange = (exampleIndex: number, value: string) => {
    const updated = messageExamples.map((example, i) => {
      if (i === exampleIndex) {
        const newExample = [...example];
        newExample[1] = { ...newExample[1], content: { text: value } };
        return newExample;
      }
      return example;
    });
    onMessageExamplesChange(updated);
  };

  return (
    <CharacterEditorSection
      title={'Examples'}
      headerIcon={
        <button
          className="icon-button help-button"
          title="Add example conversations and posts to demonstrate the character's style"
        >
          <i className="fa-solid fa-comments"></i>
        </button>
      }
    >
        {/* Message Examples */}
        <FormGroup>
          <div className="message-examples-header">
            <label>Message Examples</label>
            <button
              id="add-example"
              className="action-button add-button border border-gray-200"
              title="Add Example"
              onClick={handleAddExample}
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          <div id="message-examples-container">
            {messageExamples?.map((example, index) => (
              <div key={index} className="message-example">
                <div className="message-pair">
                  <GenericTextArea
                    placeholder="Write an example user message..."
                    className="user-message"
                    value={example[0].content.text}
                    onChange={(e) =>
                      handleUserMessageChange(index, e.target.value)
                    }
                    plain={true}
                  ></GenericTextArea>
                </div>
                <div className="message-pair">
                  <GenericTextArea
                    placeholder="Write the character's response..."
                    className="character-message"
                    value={example[1].content.text}
                    onChange={(e) =>
                      handleCharacterMessageChange(index, e.target.value)
                    }
                    plain={true}
                  ></GenericTextArea>
                </div>
                <button
                  className="action-button delete-button border border-gray-200"
                  title="Remove Example"
                  onClick={() => handleRemoveExample(index)}
                >
                  <i className='fa fa-trash'></i>
                </button>
              </div>
            ))}
          </div>
        </FormGroup>

        {/* Post Examples */}
        <FormGroup>
          <SplitTextArea
            label='Post Examples'
            id='post-examples'
            name='post-examples'
            placeholder="Write example posts that demonstrate the character's writing style. Include different types of content they might create. Write one complete post per line."
            value={postExamples} 
            onChange={(val) => onPostExamplesChange(val)}
          />
        </FormGroup>
    </CharacterEditorSection>
  );
};

export default ExamplesSection;
