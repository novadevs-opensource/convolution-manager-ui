// src/pages/EditCharacterPage.tsx
import React, { useEffect } from 'react';
import { useCharacter } from '../../hooks/useCharacter';
import { useParams } from 'react-router-dom';
import CharacterEditor from '../../components/characterEditor/CharacterEditor';
import { useAuth } from '../../hooks/useAuth';

const EditCharacterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { character, loading, error } = useCharacter(id!);
  const { token, logout, userProfile, isAuthenticated, loadUserProfile } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      loadUserProfile(); // Si el perfil no está cargado, lo cargamos
    }
  }, [isAuthenticated, userProfile, loadUserProfile]);

  if (!isAuthenticated) {
    return <div>No estás autenticado.</div>;
  }

  if (!userProfile) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <div>
      <h1>Character Editor</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {character && <CharacterEditor characterData={character?.definition} agentId={character?.id} userId={userProfile.id} />}
    </div>
  );
};

export default EditCharacterPage;
