// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PrivateRoute from './PrivateRoute';
import EditCharacterPage from '../pages/character/EditCharacterPage';
import AgentDetailPage from '../pages/character/CharacterDetailPage';
import CreateCharacterPage from '../pages/character/CreateCharacterPage';

import RegisterPage from '../pages/RegisterPage';
import PublicLayout from '../components/common/layouts/public/PublicLayout';
import ProfilePage from '../pages/ProfilePage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <PublicLayout>
          <LoginPage />
        </PublicLayout>
      } />
      <Route path="/login" element={
        <PublicLayout>
          <LoginPage />
        </PublicLayout>
      } />
      <Route path="/register" element={
        <PublicLayout>
          <RegisterPage />
        </PublicLayout>
      } />

      {/* Private routes */}
      <Route
        path="/profile"
        element={
          <PrivateRoute pageTitle='Profile'>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute pageTitle='Dashboard'>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/agent/:id"
        element={
          <PrivateRoute pageTitle='ICON data'>
            <AgentDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/agent/character/:id"
        element={
          <PrivateRoute pageTitle='Edit ICON settings'>
            <EditCharacterPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/agent/character"
        element={
          <PrivateRoute pageTitle='Create ICON'>
            <CreateCharacterPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
