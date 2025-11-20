import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../contexts/CaseContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Button from '../components/Button';
import { FileText, Users, Settings, Copy, ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';

const CreateCaseWizard = () => {
  const [step, setStep] = useState(1);
  const [caseData, setCaseData] = useState({
    title: '',
    description: '',
    type: 'personal',
    inviteEmail: '',
    inviteToken: '',
    backgroundText: '',
    goalsText: '',
    acceptableOutcomeText: '',
    constraintsText: '',
    sensitivityLevel: 'normal',
  });
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);
  const navigate = useNavigate();
  const { createDraftCase, generateInviteToken, insertContext, activateCase, uploadFile } = useCase();

  const handleInputChange = (field, value) => {
    setCaseData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const errors = [];
    const validFiles = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size exceeds 10MB limit.`);
      } else if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only PDF, JPG, PNG, and TXT files are allowed.`);
      } else {
        validFiles.push(file);
      }
    });

    setUploadErrors(errors);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newCase = await createDraftCase({
        title: caseData.title,
        description: caseData.description,
        type: caseData.type,
      });
      setCaseData(prev => ({ ...prev, id: newCase.id }));
      setStep(2);
    } catch (error) {
      console.error('Error creating case:', error);
      alert('Error creating case');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await generateInviteToken(caseData.id, caseData.inviteEmail);
      setCaseData(prev => ({ ...prev, inviteToken: token }));
      setStep(3);
    } catch (error) {
      console.error('Error generating invite:', error);
      alert('Error generating invite');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await insertContext(caseData.id, {
        background_text: caseData.backgroundText,
        goals_text: caseData.goalsText,
        acceptable_outcome_text: caseData.acceptableOutcomeText,
        constraints_text: caseData.constraintsText,
        sensitivity_level: caseData.sensitivityLevel,
      });

      // Upload selected files
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await uploadFile(caseData.id, file);
        }
      }

      await activateCase(caseData.id);
      navigate(`/mediation/${caseData.id}`);
    } catch (error) {
      console.error('Error finalizing case:', error);
      alert('Error finalizing case');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-6 animate-fade-in">
      <Input
        label="Case Title"
        value={caseData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        placeholder="Enter case title"
        required
        className="animate-slide-up"
      />
      <Textarea
        label="Description"
        value={caseData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Describe the mediation case"
        required
        rows={4}
        className="animate-slide-up"
        style={{ animationDelay: '0.1s' }}
      />
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Case Type
        </label>
        <select
          value={caseData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-neutral-50"
          required
        >
          <option value="personal">Personal</option>
          <option value="workplace">Workplace</option>
          <option value="agreement">Agreement</option>
        </select>
      </div>
      <div className="flex space-x-4 pt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Button type="submit" disabled={loading} lift>
          {loading ? 'Creating...' : 'Next'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} lift>
          Cancel
        </Button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="space-y-6 animate-fade-in">
      <Input
        label="Invite Email (optional)"
        type="email"
        value={caseData.inviteEmail}
        onChange={(e) => handleInputChange('inviteEmail', e.target.value)}
        placeholder="invited@example.com"
        className="animate-slide-up"
      />
      <div className="flex space-x-4 pt-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Button type="submit" disabled={loading} lift>
          {loading ? 'Generating...' : 'Generate Invite Link'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setStep(1)} lift>
          Back
        </Button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleStep3Submit} className="space-y-6 animate-fade-in">
      <Textarea
        label="Background"
        value={caseData.backgroundText}
        onChange={(e) => handleInputChange('backgroundText', e.target.value)}
        placeholder="Provide background information"
        required
        className="animate-slide-up"
      />
      <Textarea
        label="Goals"
        value={caseData.goalsText}
        onChange={(e) => handleInputChange('goalsText', e.target.value)}
        placeholder="What are your goals?"
        required
        className="animate-slide-up"
        style={{ animationDelay: '0.1s' }}
      />
      <Textarea
        label="Acceptable Outcome"
        value={caseData.acceptableOutcomeText}
        onChange={(e) => handleInputChange('acceptableOutcomeText', e.target.value)}
        placeholder="What outcome would be acceptable?"
        required
        className="animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      />
      <Textarea
        label="Constraints"
        value={caseData.constraintsText}
        onChange={(e) => handleInputChange('constraintsText', e.target.value)}
        placeholder="Any constraints or limitations?"
        className="animate-slide-up"
        style={{ animationDelay: '0.3s' }}
      />
      <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Sensitivity Level
        </label>
        <select
          value={caseData.sensitivityLevel}
          onChange={(e) => handleInputChange('sensitivityLevel', e.target.value)}
          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-neutral-50"
          required
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Upload Documents (optional)
        </label>
        <div className="space-y-3">
          <div className="relative">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.txt,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Upload className="h-5 w-5 mr-2 text-neutral-500" />
              <span className="text-neutral-600">Click to upload files</span>
            </label>
          </div>
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm text-neutral-700">{file.name}</span>
                    <span className="text-xs text-neutral-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {uploadErrors.length > 0 && (
          <div className="text-red-600 text-sm space-y-1">
            {uploadErrors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        )}
      </div>
      <div className="flex space-x-4 pt-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <Button type="submit" disabled={loading} lift>
          {loading ? 'Finalizing...' : 'Create Case'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setStep(2)} lift>
          Back
        </Button>
      </div>
    </form>
  );

  const renderInviteLink = () => {
    if (!caseData.inviteToken) return null;
    const inviteUrl = `${window.location.origin}/join/${caseData.inviteToken}`;
    return (
      <div className="mt-6 p-6 bg-neutral-50 rounded-xl border border-neutral-200 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <p className="text-sm font-semibold text-neutral-700 mb-3">Invite Link Generated:</p>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inviteUrl}
            readOnly
            className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-xl bg-white shadow-sm font-mono text-sm"
          />
          <Button
            type="button"
            onClick={() => navigator.clipboard.writeText(inviteUrl)}
            variant="outline"
            lift
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card hover>
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Let's Create Your Mediation Case
          </h1>
          <p className="text-neutral-600 text-lg">We'll guide you through the process step by step</p>
        </div>
        <div className="mb-12 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${step >= 1 ? 'bg-primary-500 text-white shadow-lg' : 'bg-neutral-200 text-neutral-600'}`}>
              <FileText className="h-6 w-6" />
            </div>
            <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary-500' : 'bg-neutral-200'}`}></div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${step >= 2 ? 'bg-primary-500 text-white shadow-lg' : 'bg-neutral-200 text-neutral-600'}`}>
              <Users className="h-6 w-6" />
            </div>
            <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-primary-500' : 'bg-neutral-200'}`}></div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${step >= 3 ? 'bg-primary-500 text-white shadow-lg' : 'bg-neutral-200 text-neutral-600'}`}>
              <Settings className="h-6 w-6" />
            </div>
          </div>
          <div className="flex justify-between mt-4 text-sm font-medium text-neutral-600">
            <span className={step >= 1 ? 'text-primary-600' : ''}>Case Details</span>
            <span className={step >= 2 ? 'text-primary-600' : ''}>Invite Others</span>
            <span className={step >= 3 ? 'text-primary-600' : ''}>Add Context</span>
          </div>
        </div>
        {step === 1 && renderStep1()}
        {step === 2 && (
          <>
            {renderStep2()}
            {renderInviteLink()}
          </>
        )}
        {step === 3 && renderStep3()}
      </Card>
    </div>
  );
};

export default CreateCaseWizard;