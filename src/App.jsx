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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? children : <Navigate to="/auth" />;
}

function App() {
  return (
    <AuthProvider>
      <CaseProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
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
          <Route path="/join/:token" element={
            <ProtectedRoute>
              <Layout>
                <JoinCase />
              </Layout>
            </ProtectedRoute>
          } />
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
