'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2, FileText, User, Home, CreditCard, Download, RefreshCw, Calendar } from 'lucide-react';

interface KycDocument {
  document_type: string;
  status: string;
  created_at: string;
  file_path?: string;
  rejection_reason?: string;
}

interface KycApplication {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  kyc_submitted_at: string;
  document_count: number;
  documents: KycDocument[];
}

export default function KycReviewPanel() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<KycApplication | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const fetchPendingApplications = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/kyc/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending applications');
      }

      const data = await response.json();
      setApplications(data.pending_verifications || []);
    } catch (err) {
      console.error('Failed to fetch KYC applications:', err);
      setError('Failed to load KYC applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (app: KycApplication) => {
    setSelectedApp(app);
    setReviewing(true);
    setRejectionReason('');
  };

  const handleApprove = async () => {
    if (!selectedApp || !token) return;
    await submitReview('approved');
  };

  const handleReject = async () => {
    if (!selectedApp || !token || !rejectionReason.trim()) return;
    await submitReview('rejected');
  };

  const submitReview = async (status: 'approved' | 'rejected') => {
    if (!selectedApp || !token) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/kyc/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedApp.id,
          status,
          rejection_reason: status === 'rejected' ? rejectionReason : undefined,
          first_name: selectedApp.first_name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${status} application`);
      }

      // Refresh the list
      await fetchPendingApplications();
      setReviewing(false);
      setSelectedApp(null);
    } catch (err) {
      console.error(`Error ${status}ing application:`, err);
      setError(`Failed to ${status} application. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadDocument = async (filePath: string, documentType: string) => {
    if (!token) return;
    
    try {
      // This endpoint should be implemented in your backend to serve the document securely
      const response = await fetch(`/api/kyc/documents/${encodeURIComponent(filePath)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to download document');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kyc_${documentType}_${Date.now()}.${filePath.split('.').pop() || 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document');
    }
  };

  useEffect(() => {
    if (token) {
      fetchPendingApplications();
    }
  }, [token]);

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
                onClick={fetchPendingApplications}
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

  if (reviewing && selectedApp) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Review KYC Application
          </h2>
          <button
            onClick={() => setReviewing(false)}
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            Back to list
          </button>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {selectedApp.first_name} {selectedApp.last_name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {selectedApp.email} • Submitted on {new Date(selectedApp.kyc_submitted_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Documents</h4>
              <div className="space-y-3">
                {selectedApp.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        {documentIcons[doc.document_type as keyof typeof documentIcons] || documentIcons.other}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {documentLabels[doc.document_type as keyof typeof documentLabels] || 'Document'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => doc.file_path && downloadDocument(doc.file_path, doc.document_type)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedApp.documents.some(doc => doc.status === 'rejected') && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Previous Rejection</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        {selectedApp.documents.find(doc => doc.status === 'rejected')?.rejection_reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <div className="flex-1">
                  <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
                    Rejection Reason (if applicable)
                  </label>
                  <div className="mt-1">
                    <textarea
                      rows={3}
                      id="rejection-reason"
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Please specify the reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setReviewing(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={submitting || !rejectionReason.trim()}
                >
                  {submitting ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Pending KYC Verifications</h2>
        <button
          onClick={fetchPendingApplications}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="w-3 h-3 mr-1.5" />
          Refresh
        </button>
      </div>
      
      {applications.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending verifications</h3>
          <p className="mt-1 text-sm text-gray-500">All KYC applications have been reviewed.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {applications.map((app) => (
              <li key={app.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600 truncate">
                        {app.first_name} {app.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{app.email}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <button
                        onClick={() => handleReview(app)}
                        className="px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <FileText className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {app.document_count} document{app.document_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>
                        Submitted on{' '}
                        <time dateTime={app.kyc_submitted_at}>
                          {new Date(app.kyc_submitted_at).toLocaleDateString()}
                        </time>
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
