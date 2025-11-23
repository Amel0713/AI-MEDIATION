import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CaseProvider } from './contexts/CaseContext';
import Layout from './layouts/Layout';
import Auth from './screens/Auth';
import Dashboard from './screens/Dashboard';
import CreateCaseWizard from './screens/CreateCaseWizard';
import JoinCase from './screens/JoinCase';
import JoinCasePrompt from './screens/JoinCasePrompt';
import MediationRoom from './screens/MediationRoom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Protected route component that requires authentication
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication status
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Redirect to auth page if not authenticated
  return user ? children : <Navigate to="/auth" />;
}

// Main App component that sets up routing and context providers
function App() {
  return (
    // AuthProvider manages user authentication state
    <AuthProvider>
      {/* CaseProvider manages case-related data and operations */}
      <CaseProvider>
        <Routes>
          {/* Public authentication route */}
          <Route path="/auth" element={<Auth />} />
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          {/* Protected routes requiring authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/create-case" element={
            <ProtectedRoute>
              <Layout>
                <CreateCaseWizard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/join-case" element={
            <ProtectedRoute>
              <Layout>
                <JoinCasePrompt />
              </Layout>
            </ProtectedRoute>
          } />
          {/* Dynamic route for joining with invite token */}
          <Route path="/join/:token" element={
            <ProtectedRoute>
              <Layout>
                <JoinCase />
              </Layout>
            </ProtectedRoute>
          } />
          {/* Dynamic route for mediation room with case ID */}
          <Route path="/mediation/:caseId" element={
            <ProtectedRoute>
              <Layout>
                <MediationRoom />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </CaseProvider>
    </AuthProvider>
  );
}

export default App;
