import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const CaseContext = createContext();

export const useCase = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
};

export const CaseProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentCase, setCurrentCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    console.log('fetchCases called, user:', user);
    if (!user) {
      console.log('No user, returning early');
      setLoading(false);
      return;
    }
    try {
      console.log('About to execute supabase query for cases');
      const startTime = Date.now();
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000);
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(abortController.signal);
      clearTimeout(timeoutId);
      const endTime = Date.now();
      console.log('Supabase query completed in', endTime - startTime, 'ms');

      if (error) {
        console.error('Error fetching cases:', error?.message || JSON.stringify(error));
      } else {
        console.log('Fetched cases successfully, count:', data?.length || 0, 'data:', data);
        setCases(data || []);
      }
    } catch (err) {
      console.error('Exception in fetchCases:', err?.message || JSON.stringify(err));
    }
    console.log('Setting loading to false');
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, [user]);

  const createDraftCase = async (caseData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: caseResult, error: caseError } = await supabase
      .from('cases')
      .insert({
        ...caseData,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (caseError) throw caseError;

    // Add initiator to participants
    const { error: participantError } = await supabase
      .from('case_participants')
      .insert({
        case_id: caseResult.id,
        user_id: user.id,
        role_in_case: 'initiator',
      });

    if (participantError) throw participantError;

    setCases(prev => [caseResult, ...prev]);
    setCurrentCase(caseResult);
    return caseResult;
  };

  const generateInviteToken = async (caseId, inviteEmail) => {
    const inviteToken = crypto.randomUUID();

    const { error } = await supabase
      .from('cases')
      .update({ invite_token: inviteToken, invite_email: inviteEmail })
      .eq('id', caseId);

    if (error) throw error;

    updateCase(caseId, { invite_token: inviteToken, invite_email: inviteEmail });
    return inviteToken;
  };

  const insertContext = async (caseId, contextData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('case_context')
      .insert({
        case_id: caseId,
        user_id: user.id,
        ...contextData,
      });

    if (error) throw error;
  };

  const activateCase = async (caseId) => {
    const { error } = await supabase
      .from('cases')
      .update({ status: 'active' })
      .eq('id', caseId);

    if (error) throw error;

    updateCase(caseId, { status: 'active' });
  };

  const validateInviteToken = async (token) => {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (error) throw error;
    return data;
  };

  const joinCaseWithToken = async (caseId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('case_participants')
      .insert({
        case_id: caseId,
        user_id: user.id,
        role_in_case: 'invited_party',
      });

    if (error) throw error;

    const caseItem = cases.find(c => c.id === caseId);
    if (caseItem) {
      setCurrentCase(caseItem);
    } else {
      // Fetch the case if not in local state
      const { data, error: fetchError } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (fetchError) throw fetchError;
      setCurrentCase(data);
      setCases(prev => [data, ...prev]);
    }
  };

  const uploadFile = async (caseId, file) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Upload file to Supabase storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `case-files/${caseId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('case-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Insert file record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('case_files')
      .insert({
        case_id: caseId,
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return fileRecord;
  };

  const getCaseFiles = async (caseId) => {
    const { data, error } = await supabase
      .from('case_files')
      .select('*')
      .eq('case_id', caseId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  const updateCase = (caseId, updates) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, ...updates } : c));
    if (currentCase?.id === caseId) {
      setCurrentCase(prev => ({ ...prev, ...updates }));
    }
  };

  const value = {
    currentCase,
    cases,
    loading,
    createDraftCase,
    generateInviteToken,
    insertContext,
    activateCase,
    validateInviteToken,
    joinCaseWithToken,
    updateCase,
    fetchCases,
    uploadFile,
    getCaseFiles,
  };

  return (
    <CaseContext.Provider value={value}>
      {children}
    </CaseContext.Provider>
  );
};