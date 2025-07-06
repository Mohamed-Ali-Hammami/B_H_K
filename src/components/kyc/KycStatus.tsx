'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getKycStatus, type KycStatus, KycDocument } from '../../services/authService';
import { CheckCircle, XCircle, Clock, Loader2, FileText, User, Home, CreditCard } from 'lucide-react';
import Link from 'next/link';

// Define types based on authService.ts
type KycDocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired';
type KycStatusType = 'not_started' | 'in_progress' | 'pending' | 'approved' | 'rejected';

interface StatusIcons {
  [key: string]: React.ReactNode;
}

interface DocumentIcons {
  [key: string]: React.ReactNode;
}

interface DocumentLabels {
  [key: string]: string;
}

const statusIcons: StatusIcons = {
  approved: <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />,
  rejected: <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />,
  pending: <Clock className="w-5 h-5 text-yellow-500" aria-hidden="true" />,
  in_progress: <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" aria-hidden="true" />,
  not_started: <FileText className="w-5 h-5 text-gray-400" aria-hidden="true" />,
};

const documentIcons: DocumentIcons = {
  id_front: <CreditCard className="w-5 h-5 text-gray-600" aria-hidden="true" />,
  id_back: <CreditCard className="w-5 h-5 text-gray-600" aria-hidden="true" />,
  selfie: <User className="w-5 h-5 text-gray-600" aria-hidden="true" />,
  proof_of_address: <Home className="w-5 h-5 text-gray-600" aria-hidden="true" />,
  other: <FileText className="w-5 h-5 text-gray-600" aria-hidden="true" />,
};

const documentLabels: DocumentLabels = {
  id_front: 'ID Front',
  id_back: 'ID Back',
  selfie: 'Selfie',
  proof_of_address: 'Proof of Address',
  other: 'Other Document',
};

const getStatusBadge = (status: KycStatusType | KycDocumentStatus) => {
  const statusText = status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Handle document status separately from KYC status
  const isDocumentStatus = (s: string): s is KycDocumentStatus => 
    ['pending', 'approved', 'rejected', 'expired'].includes(s);

  const getStatusClasses = (s: string) => {
    if (s === 'approved') return 'bg-green-100 text-green-800';
    if (s === 'rejected' || s === 'expired') return 'bg-red-100 text-red-800';
    if (s === 'pending' || s === 'in_progress') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(status)}`}
      aria-label={`Status: ${statusText}`}
    >
      {statusIcons[status] || statusIcons.not_started}
      <span className="ml-1.5">{statusText}</span>
    </span>
  );
};

const renderDocumentStatus = (doc: KycDocument) => {
  const { document_type, status, created_at, updated_at } = doc;
  const icon = documentIcons[document_type] || documentIcons.other;
  const label = documentLabels[document_type] || 'Document';
  
  return (
    <div
      key={document_type}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg bg-white"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-full bg-gray-100">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{label}</h4>
          <p className="text-sm text-gray-500">
            Uploaded: {new Date(created_at).toLocaleDateString()}
            {updated_at && updated_at !== created_at && 
              ` • Updated: ${new Date(updated_at).toLocaleDateString()}`}
          </p>
        </div>
      </div>
      <div className="mt-3 sm:mt-0">{getStatusBadge(status)}</div>
    </div>
  );
};

export default function KycStatus() {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKycStatus = useCallback(async () => {
    // No need to require token since we're not using it anymore
    setLoading(true);
    setError(null);

    try {
      // Prepare parameters for getKycStatus
      const statusParams: { userId?: string; tempUserId?: string } = {};
      
      // If we have a logged-in user, use their ID
      if (user?.id) {
        statusParams.userId = user.id.toString();
      }
      
      // If we have a tempUserId in the URL, use it
      const urlParams = new URLSearchParams(window.location.search);
      const tempUserId = urlParams.get('tempUserId');
      if (tempUserId) {
        statusParams.tempUserId = tempUserId;
      }
      
      // If we have no user ID at all, pass an empty object to get default status
      const data = Object.keys(statusParams).length > 0 
        ? await getKycStatus(statusParams)
        : await getKycStatus({});
        
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch KYC status:', err);
      setError('Failed to load KYC status. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id, not token

  useEffect(() => {
    fetchKycStatus();
    const interval = setInterval(fetchKycStatus, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchKycStatus]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" aria-hidden="true" />
        <span className="sr-only">Loading KYC status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4" role="alert">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <div className="mt-2">
              <button
                type="button"
                onClick={fetchKycStatus}
                className="rounded-md bg-red-50 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 px-4 py-2"
                aria-label="Retry loading KYC status"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!status || !user || !token) {
    return (
      <div className="text-center p-6" role="alert">
        <p className="text-red-600">Please log in to view your KYC status.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 rounded-xl min-h-[400px] flex flex-col space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">KYC Verification Status</h1>

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Verification Status</h2>
            <p className="mt-1 text-sm text-gray-600">
              {status.status === 'approved'
                ? 'Your identity has been verified.'
                : status.status === 'rejected'
                ? 'Your documents require attention.'
                : status.status === 'pending'
                ? 'Your documents are under review.'
                : status.status === 'in_progress'
                ? 'Your verification is in progress.'
                : 'Please complete your KYC verification to access all features.'}
            </p>
          </div>
          <div>{getStatusBadge(status.status)}</div>
        </div>

        {status.next_steps && status.next_steps.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Next Steps</h3>
            <ul role="list" className="mt-2 space-y-2">
              {status.next_steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-sm text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Documents</h3>
        <div className="space-y-3">
          {status.documents && status.documents.length > 0 ? (
            status.documents.map(renderDocumentStatus)
          ) : (
            <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
          )}
        </div>
      </div>

      {status.status !== 'approved' && (
        <div className="rounded-lg bg-red-50 p-4" role="alert">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Verification Required</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  To comply with regulations, we need to verify your identity. Please ensure all
                  documents are clear and valid.
                </p>
                {(status.status === 'rejected' || status.status === 'not_started') && (
                  <Link
                    href="/kyc-verification"
                    className="mt-2 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    aria-label="Start or retry KYC verification"
                  >
                    {status.status === 'rejected' ? 'Retry Verification' : 'Start Verification'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}