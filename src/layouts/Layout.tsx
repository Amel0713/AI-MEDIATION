/* eslint-disable no-console */
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black/95 backdrop-blur-sm shadow-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-3 transition-transform duration-200 hover:scale-105">
                <img src="/mediatorai.png" alt="MediatorAI" className="h-10 w-auto" />
                <span className="text-xl font-bold text-white hidden sm:block">MediatorAI</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              {user && (
                <>
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-300">
                      Welcome, {user.email ? user.email.split('@')[0] : 'User'}
                    </span>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="bg-black border-t border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-400 leading-relaxed max-w-4xl mx-auto">
              <strong>Disclaimer:</strong> This AI-powered mediation tool is provided for informational purposes only and does not constitute legal advice.
              Users should consult with qualified legal professionals for any legal matters. The AI mediator facilitates communication but does not guarantee resolution or enforce agreements.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;