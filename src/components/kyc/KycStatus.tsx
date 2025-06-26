'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KycStatus as KycStatusType, getKycStatus, KycDocument } from '../../services/authService';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2, FileText, User, Home, CreditCard } from 'lucide-react';

const statusIcons = {
  approved: <CheckCircle className="text-green-500" />,
  rejected: <XCircle className="text-red-500" />,
  pending: <Clock className="text-yellow-500" />,
  in_prograde: <AlertCircle className="text-red-500" />,
  not_started: <FileText className="text-gray-400" />,
};

const documentIcons = {
  id_front: <CreditCard className="w-5 h-5" />,
  id_back: <CreditCard className="w-5 h-5" />,
  selfie: <User className="w-5 h-5" />,
  proof_of_address: <Home className="w-5 h-5" />,
  other: <FileText className="w-5 h-5" />,
};

const documentLabels = {
  id_front: 'ID Front',
  id_back: 'ID Back',
  selfie: 'Selfie',
  proof_of_address: 'Proof of Address',
  other: 'Other Document',
};

export default function KycStatus() {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<KycStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKycStatus = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getKycStatus(token);
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch KYC status:', err);
      setError('Failed to load KYC status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchKycStatus();
    }
  }, [token]);

  const getStatusBadge = (status: string) => {
    const statusText = status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        status === 'approved' ? 'bg-green-100 text-green-800' :
        status === 'rejected' ? 'bg-red-100 text-red-800' :
        status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {statusIcons[status as keyof typeof statusIcons] || statusIcons.not_started}
        <span className="ml-1.5">{statusText}</span>
      </span>
    );
  };

  const renderDocumentStatus = (doc: KycDocument) => (
    <div key={doc.document_type} className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-full bg-gray-100">
          {documentIcons[doc.document_type as keyof typeof documentIcons] || documentIcons.other}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">
            {documentLabels[doc.document_type as keyof typeof documentLabels] || 'Document'}
          </h4>
          <p className="text-sm text-gray-500">
            {new Date(doc.created_at).toLocaleDateString()}
            {doc.rejection_reason && ` • ${doc.rejection_reason}`}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        {getStatusBadge(doc.status)}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <div className="mt-2">
              <button
                type="button"
                onClick={fetchKycStatus}
                className="rounded-md bg-red-50 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">KYC Verification Status</h2>
            <p className="mt-1 text-sm text-gray-500">
              {status.status === 'approved' ? 'Your identity has been verified.' :
               status.status === 'rejected' ? 'Your documents require attention.' :
               status.status === 'pending' ? 'Your documents are under review.' :
               'Please complete your KYC verification to access all features.'}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            {getStatusBadge(status.status)}
          </div>
        </div>

        {status.next_steps && status.next_steps.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Next Steps</h3>
            <ul role="list" className="mt-2 space-y-2">
              {status.next_steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
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
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Verification Required</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  To comply with regulations, we need to verify your identity. Please ensure all documents are clear and valid.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
