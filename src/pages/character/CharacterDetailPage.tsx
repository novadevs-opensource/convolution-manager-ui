// src/pages/CharacterDetailPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../../hooks/useCharacter';

const CharacterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the character ID from URL params
  const { character, loading, error } = useCharacter(id!);

  if (loading) return <p>Loading character...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>{character?.id}</h1>
      <p>
        <a
          href={`/agent/character/${id}`}
          title="Convolution Main Repository"
          rel="noopener"
        >
          Edit character
        </a>
      </p>
      <p><strong>Data:</strong> {JSON.stringify(character?.definition)}</p>
    </div>
  );
};

export default CharacterDetailPage;
