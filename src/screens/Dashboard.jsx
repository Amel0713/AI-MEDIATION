import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../contexts/CaseContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus, Users, FolderOpen, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { cases } = useCase();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-secondary-900 mb-2">Welcome to AI Mediation</h1>
        <p className="text-lg text-secondary-600">Let's work together to resolve your disputes peacefully</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <Plus className="h-8 w-8 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-secondary-900">Start New Case</h2>
          </div>
          <p className="text-secondary-600 mb-6">Begin your journey towards peaceful resolution</p>
          <Button onClick={() => navigate('/create-case')} className="w-full flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            Create Case
          </Button>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <Users className="h-8 w-8 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-secondary-900">Join Existing Case</h2>
          </div>
          <p className="text-secondary-600 mb-6">Connect with others in an ongoing mediation</p>
          <Button onClick={() => navigate('/join-case')} variant="outline" className="w-full flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />
            Join Case
          </Button>
        </Card>
      </div>

      {cases.length > 0 && (
        <Card>
          <div className="flex items-center mb-6">
            <FolderOpen className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-secondary-900">Your Active Cases</h2>
          </div>
          <div className="space-y-3">
            {cases.map((caseItem) => (
              <div key={caseItem.id} className="flex justify-between items-center p-4 bg-secondary-50 rounded-lg border border-secondary-200 hover:bg-secondary-100 transition-colors">
                <div className="flex items-center">
                  <FolderOpen className="h-5 w-5 text-secondary-500 mr-3" />
                  <span className="font-medium text-secondary-900">{caseItem.title || `Case ${caseItem.id}`}</span>
                </div>
                <Button onClick={() => navigate(`/mediation/${caseItem.id}`)} size="sm" className="flex items-center gap-1">
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