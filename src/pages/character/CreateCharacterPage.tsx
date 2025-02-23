// src/pages/EditCharacterPage.tsx
import React, { useEffect } from 'react';
import CharacterEditor from '../../components/characterEditor/CharacterEditor';
import { useAuth } from '../../hooks/useAuth';

const CreateCharacterPage: React.FC = () => {
  const { userProfile, token, logout, loadUserProfile, isAuthenticated } = useAuth();
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
      <h1>Character creator</h1>
      <p>Token: {token}</p>
      <button onClick={logout}>Logout</button>

      <CharacterEditor userId={userProfile.id}/>
    </div>
  );
};

export default CreateCharacterPage;
