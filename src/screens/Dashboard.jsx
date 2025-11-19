import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../contexts/CaseContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus, Users, FolderOpen, ArrowRight, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { cases, loading, error, fetchCases } = useCase();
  const [timeoutError, setTimeoutError] = useState(false);

  console.log('Dashboard render - cases:', cases, 'loading:', loading, 'error:', error, 'timeoutError:', timeoutError);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutError(true);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setTimeoutError(false);
    }
  }, [loading]);

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="text-center animate-slide-up">
        <h1 className="text-5xl font-bold text-neutral-900 mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Welcome to AI Mediation
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          Let's work together to resolve your disputes peacefully with the power of artificial intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card hover className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center mb-6">
            <div className="p-3 bg-primary-100 rounded-xl mr-4">
              <Plus className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Start New Case</h2>
              <p className="text-neutral-600">Begin your journey towards peaceful resolution</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/create-case')}
            className="w-full flex items-center justify-center gap-2"
            lift
          >
            <Plus className="h-5 w-5" />
            Create Case
          </Button>
        </Card>

        <Card hover className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center mb-6">
            <div className="p-3 bg-primary-100 rounded-xl mr-4">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Join Existing Case</h2>
              <p className="text-neutral-600">Connect with others in an ongoing mediation</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/join-case')}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            lift
          >
            <Users className="h-5 w-5" />
            Join Case
          </Button>
        </Card>
      </div>

      {loading && !timeoutError && (
        <div className="text-center animate-fade-in">
          <p className="text-xl text-neutral-600">Loading your cases...</p>
        </div>
      )}

      {(error || timeoutError) && (
        <Card className="animate-fade-in">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">
              {timeoutError ? 'Loading timed out. Please try again.' : `Failed to load cases: ${error}`}
            </p>
            <Button onClick={() => { setTimeoutError(false); fetchCases(); }} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && cases.length === 0 && (
        <Card className="animate-fade-in">
          <div className="text-center">
            <div className="p-3 bg-neutral-100 rounded-xl mb-4 inline-block">
              <FolderOpen className="h-8 w-8 text-neutral-500" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Active Cases</h3>
            <p className="text-neutral-600">You haven't started any mediation cases yet. Create your first case to get started.</p>
          </div>
        </Card>
      )}

      {cases.length > 0 && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center mb-8">
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <FolderOpen className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Your Active Cases</h2>
          </div>
          <div className="space-y-4">
            {cases.map((caseItem, index) => (
              <div
                key={caseItem.id}
                className="flex justify-between items-center p-6 bg-neutral-50 rounded-xl border border-neutral-200 hover:bg-neutral-100 hover:shadow-md transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-white rounded-lg mr-4 shadow-sm">
                    <FolderOpen className="h-5 w-5 text-neutral-500" />
                  </div>
                  <span className="font-semibold text-neutral-900 text-lg">
                    {caseItem.title || `Case ${caseItem.id}`}
                  </span>
                </div>
                <Button
                  onClick={() => navigate(`/mediation/${caseItem.id}`)}
                  size="sm"
                  className="flex items-center gap-2"
                  lift
                >
                  Enter
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;