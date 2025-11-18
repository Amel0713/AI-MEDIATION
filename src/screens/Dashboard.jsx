import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../contexts/CaseContext';
import Card from '../components/Card';
import Button from '../components/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { cases } = useCase();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your mediation cases</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Create New Case</h2>
          <p className="text-gray-600 mb-4">Start a new mediation case</p>
          <Button onClick={() => navigate('/create-case')} className="w-full">
            Create Case
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Join Existing Case</h2>
          <p className="text-gray-600 mb-4">Join an existing mediation session</p>
          <Button onClick={() => navigate('/join-case')} variant="outline" className="w-full">
            Join Case
          </Button>
        </Card>
      </div>

      {cases.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Your Cases</h2>
          <div className="space-y-2">
            {cases.map((caseItem) => (
              <div key={caseItem.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>{caseItem.title || `Case ${caseItem.id}`}</span>
                <Button onClick={() => navigate(`/mediation/${caseItem.id}`)} size="sm">
                  Enter
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