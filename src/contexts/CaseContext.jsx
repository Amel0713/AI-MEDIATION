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
    console.log({
      timestamp: new Date().toISOString(),
      operation: 'fetchCases',
      status: 'start',
      userId: user?.id,
      loading: loading,
    });
    if (!user) {
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'fetchCases',
        status: 'noUser',
        loading: loading,
      });
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'fetchCases',
        status: 'beforeSetLoadingFalse',
        loading: loading,
      });
      setLoading(false);
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'fetchCases',
        status: 'afterSetLoadingFalse',
        loading: false,
      });
      return;
    }
    try {
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'fetchCases',
        status: 'beforeCaseQuery',
        userId: user.id,
      });
      const startTime = Date.now();
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000);
      const { data, error } = await supabase
        .from('cases')
        .select('*, case_participants(user_id, role_in_case)')
        .order('created_at', { ascending: false })
        .abortSignal(abortController.signal);
      clearTimeout(timeoutId);
      const endTime = Date.now();
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'fetchCases',
        status: 'afterCaseQuery',
        duration: endTime - startTime,
        error: error?.message,
        dataCount: data?.length || 0,
      });

      if (error) {
        console.error('Error fetching cases:', error?.message || JSON.stringify(error));
      } else {
        console.log('Fetched cases successfully, count:', data?.length || 0);
        setCases(data || []);
      }
    } catch (err) {
      console.error('Exception in fetchCases:', err?.message || JSON.stringify(err));
    }
    console.log({
      timestamp: new Date().toISOString(),
      operation: 'fetchCases',
      status: 'beforeSetLoadingFalse',
      loading: loading,
    });
    setLoading(false);
    console.log({
      timestamp: new Date().toISOString(),
      operation: 'fetchCases',
      status: 'afterSetLoadingFalse',
      loading: false,
    });
  };

  useEffect(() => {
    fetchCases();
  }, [user]);

  const createDraftCase = async (caseData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log({
      timestamp: new Date().toISOString(),
      userId: user.id,
      operation: 'createDraftCase',
      status: 'attempt',
      caseData: { title: caseData.title, type: caseData.type }, // Avoid logging sensitive data
    });

    try {
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

      console.log({
        timestamp: new Date().toISOString(),
        userId: user.id,
        operation: 'createDraftCase',
        status: 'success',
        caseId: caseResult.id,
        caseTitle: caseResult.title,
      });

      setCases(prev => [caseResult, ...prev]);
      setCurrentCase(caseResult);
      return caseResult;
    } catch (error) {
      console.log({
        timestamp: new Date().toISOString(),
        userId: user.id,
        operation: 'createDraftCase',
        status: 'failure',
        error: error.message,
      });
      throw error;
    }
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

    console.log({
      timestamp: new Date().toISOString(),
      userId: user.id,
      operation: 'joinCaseWithToken',
      status: 'attempt',
      caseId: caseId,
    });

    try {
      const { error } = await supabase
        .from('case_participants')
        .insert({
          case_id: caseId,
          user_id: user.id,
          role_in_case: 'invited_party',
        });

      if (error) throw error;

      console.log({
        timestamp: new Date().toISOString(),
        userId: user.id,
        operation: 'joinCaseWithToken',
        status: 'success',
        caseId: caseId,
      });

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
    } catch (error) {
      console.log({
        timestamp: new Date().toISOString(),
        userId: user.id,
        operation: 'joinCaseWithToken',
        status: 'failure',
        caseId: caseId,
        error: error.message,
      });
      throw error;
    }
  };

  const uploadFile = async (caseId, file) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log({
      timestamp: new Date().toISOString(),
      userId: user.id,
      operation: 'uploadFile',
      status: 'attempt',
      caseId: caseId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    try {
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

      console.log({
        timestamp: new Date().toISOString(),
        userId: user.id,
        operation: 'uploadFile',
        status: 'success',
        caseId: caseId,
        fileId: fileRecord.id,
        fileName: file.name,
      });

      return fileRecord;
    } catch (error) {
      console.log({
        timestamp: new Date().toISOString(),
        userId: user.id,
        operation: 'uploadFile',
        status: 'failure',
        caseId: caseId,
        fileName: file.name,
        error: error.message,
      });
      throw error;
    }
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