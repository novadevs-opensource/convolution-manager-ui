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
  forWizard?: boolean;
}

const ExamplesSection: React.FC<ExamplesSectionProps> = ({
  messageExamples,
  postExamples,
  characterName,
  onMessageExamplesChange,
  onPostExamplesChange,
  forWizard,
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

  if (forWizard) {
    return (
      <div>
        {/* Message Examples */}
        <FormGroup>
          <div className="flex flex-row items-center justify-between">
            <h3 className='text-lg font-bold font-anek-latin'>Message Examples <span className='text-sm text-gray-500 font-medium'>({messageExamples.length} entries)</span></h3>
            <button
              id="add-example"
              className="w-10 h-10 bg-yellow-500 hover:border-black hover:bg-black hover:text-white rounded-full border border-yellow-500 border-2"
              title="Add Example"
              onClick={handleAddExample}
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          <div id="message-examples-container">
            {messageExamples?.map((example, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg flex flex-row gap-3 mb-4">
                <div className="message-pair grow">
                  <GenericTextArea
                    placeholder="Write an example user message..."
                    className="border-0 bg-beige-50 min-h-[140px]"
                    value={example[0].content.text}
                    onChange={(e) =>
                      handleUserMessageChange(index, e.target.value)
                    }
                    label='User message example'
                    plain={true}
                  ></GenericTextArea>
                </div>
                <div className="message-pair grow">
                  <GenericTextArea
                    placeholder="Write the character's response..."
                    className="border-0 bg-beige-50 min-h-[140px]"
                    value={example[1].content.text}
                    onChange={(e) =>
                      handleCharacterMessageChange(index, e.target.value)
                    }
                    label='Your Agent response example'
                    plain={true}
                  ></GenericTextArea>
                </div>
                <button
                  className="w-10 h-10 bg-yellow-500 hover:bg-black hover:text-white rounded-full border border-yellow-500 hover:border-black border-2"
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
            customLabel={<h3 className='text-lg font-bold font-anek-latin mb-4'>Post Examples <span className='text-sm text-gray-500 font-medium'>({postExamples.length} entries)</span></h3>}
            id='post-examples'
            name='post-examples'
            plain={true}
            placeholder="Write example posts that demostrate the character's writing style. Include different types of content they might create. Write one complete post per line."
            value={postExamples} 
            className="border-0 border-b-2 bg-white min-h-[140px]"
            onChange={(val) => onPostExamplesChange(val)}
          />
        </FormGroup>
      </div>
    )
  }

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
              <div key={index} className="message-example bg-gray-50 p-2 border-gray-100 border rounded">
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
            placeholder="Write example posts that demontrate the character's writing style. Include different types of content they might create. Write one complete post per line."
            value={postExamples} 
            onChange={(val) => onPostExamplesChange(val)}
          />
        </FormGroup>
    </CharacterEditorSection>
  );
};

export default ExamplesSection;
