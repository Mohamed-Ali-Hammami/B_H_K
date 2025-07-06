'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadKycDocument, getKycStatus } from '../../services/authService';
import KycStatus from './KycStatus';

// Define supported document types aligned with authService.ts
type DocumentField = 'front' | 'back' | 'selfie' | 'proof_of_address';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  requiredFields: DocumentField[];
  acceptedFiles: string[];
  maxFileSize: number; // in bytes
}

// Make KYC status type reusable
type KYCStatus = 'not_started' | 'in_progress' | 'pending' | 'approved' | 'rejected' | 'expired';

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'id_front',
    name: 'ID Card',
    description: 'Upload front and back of your government-issued ID card.',
    requiredFields: ['front', 'back', 'selfie'],
    acceptedFiles: ['image/jpeg', 'image/png', 'application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
  {
    id: 'proof_of_address',
    name: 'Proof of Address',
    description: 'Upload a utility bill or bank statement showing your address (not older than 3 months).',
    requiredFields: ['proof_of_address'],
    acceptedFiles: ['image/jpeg', 'image/png', 'application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
];

const KycVerification: React.FC<{
  onVerificationComplete: (status: 'success' | 'failed') => void;
  onClose: () => void;
  tempUserId?: string;
}> = ({ onVerificationComplete, onClose, tempUserId }) => {
  const { user, token } = useAuth();
  const [step, setStep] = useState<'select' | 'upload' | 'selfie' | 'proof' | 'review' | 'status'>('select');
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<{ status: KYCStatus; next_steps?: string[] } | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update KYC status handler
  const updateKycStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare parameters for getKycStatus
      const statusParams: { userId?: string; tempUserId?: string } = {};
      
      // If we have a logged-in user, use their ID
      if (user?.id) {
        statusParams.userId = user.id;
      }
      
      // If we have a tempUserId, include it as well
      if (tempUserId) {
        statusParams.tempUserId = tempUserId;
      }
      
      // If we have no user ID at all, pass an empty object to get default status
      const status = Object.keys(statusParams).length > 0 
        ? await getKycStatus(statusParams)
        : await getKycStatus({});
        
      setKycStatus(status);
      
      // Handle different KYC statuses
      switch (status.status) {
        case 'approved':
          onVerificationComplete('success');
          setStep('status');
          break;
        case 'rejected':
          onVerificationComplete('failed');
          setStep('status');
          break;
        case 'pending':
        case 'in_progress':
          setStep('status');
          break;
        default:
          // For 'not_started' or any other status, stay in current flow
          break;
      }
    } catch (err) {
      console.error('Error fetching KYC status:', err);
      setError('Failed to load KYC status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, token, tempUserId, onVerificationComplete]);

  // Handle document upload with proper error handling
  const handleDocumentUpload = useCallback(async (file: File, type: DocumentField) => {
    if (!file || !selectedDoc) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check file size and type
      if (file.size > selectedDoc.maxFileSize) {
        throw new Error(`File size exceeds the maximum allowed size of ${selectedDoc.maxFileSize / (1024 * 1024)}MB`);
      }

      if (!selectedDoc.acceptedFiles.includes(file.type)) {
        throw new Error(`Invalid file type. Please upload one of: ${selectedDoc.acceptedFiles.join(', ')}`);
      }

      // Update UI based on the uploaded document type
      switch (type) {
        case 'front':
          setFrontFile(file);
          setStep('upload');
          break;
        case 'back':
          setBackFile(file);
          setStep('selfie');
          break;
        case 'selfie':
          setSelfieFile(file);
          setStep('proof');
          break;
        case 'proof_of_address':
          setProofFile(file);
          setStep('review');
          break;
      }

      // Upload the document
      await uploadKycDocument(
        token || '',
        tempUserId || user?.id || '',
        file,
        type,
        type === 'selfie' ? file : undefined,
        !!tempUserId
      );

      // Refresh KYC status after successful upload
      await updateKycStatus();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDoc, token, tempUserId, user?.id, updateKycStatus]);

  // Cleanup resources
  const cleanupResources = useCallback(() => {
    if (documentPreview) {
      URL.revokeObjectURL(documentPreview);
      setDocumentPreview(null);
    }
    if (selfiePreview) {
      URL.revokeObjectURL(selfiePreview);
      setSelfiePreview(null);
    }
    stopCamera();
  }, [documentPreview, selfiePreview]);

  useEffect(() => {
    return () => cleanupResources();
  }, [cleanupResources]);

  // Fetch KYC status on mount
  useEffect(() => {
    const fetchKycStatus = async () => {
      // Ensure we have a valid token before proceeding
      if ((!tempUserId && !user) || !token) {
        console.log('No token available to fetch KYC status');
        return;
      }
      
      try {
        const status = await getKycStatus(token);
        setKycStatus(status);
        if (status.status === 'approved' || status.status === 'rejected') {
          setStep('status');
        }
      } catch (err) {
        console.error('Error fetching KYC status:', err);
        setError('Failed to load KYC status. Please try again.');
      }
    };
    fetchKycStatus();

    // Polling for status updates
    const interval = setInterval(fetchKycStatus, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [token, tempUserId, user]);

  // Check camera permission status
  const checkCameraPermission = async (): Promise<boolean> => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return true; // Fallback to direct request if permissions API is unavailable
    }
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return permission.state === 'granted' || permission.state === 'prompt';
    } catch (err) {
      console.error('Error checking camera permission:', err);
      return false;
    }
  };

  // Start camera with permission check
  const startCamera = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraAvailable(false);
      setError('Your device does not support camera access. Please upload a selfie file instead.');
      setIsLoading(false);
      return;
    }

    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      setError(
        'Camera access is required. Please allow camera access in your device settings and retry. ' +
        '<a href="https://support.google.com/chrome/answer/2693767" target="_blank" rel="noopener noreferrer" class="underline">Learn how</a>.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: 'user' },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch((err) => {
              console.error('Error playing video:', err);
              setError('Error playing camera feed. Please refresh and try again.');
            });
          }
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMessage = 'Could not access camera. ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access in your device settings. <a href="https://support.google.com/chrome/answer/2693767" target="_blank" rel="noopener noreferrer" class="underline">Learn how</a>.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found. Please connect a camera or upload a selfie file.';
        setCameraAvailable(false);
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is in use by another application. Please close other apps and retry.';
      } else {
        errorMessage += `Error: ${err.message || 'Unknown error'}`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Capture selfie from webcam
  const captureSelfie = () => {
    if (!canvasRef.current || !videoRef.current || !videoRef.current.videoWidth) {
      setError('Camera is not ready. Please try again.');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      setError('Failed to capture image. Please try again.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelfieFile(file);
          setSelfiePreview(URL.createObjectURL(file));
          setHasUnsavedChanges(true);
          stopCamera();
          setStep('review');
        }
      },
      'image/jpeg',
      0.95
    );
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Handle document selection
  const handleDocumentSelect = (doc: DocumentType) => {
    setSelectedDoc(doc);
    setStep(doc.id === 'proof_of_address' ? 'proof' : 'upload');
    setHasUnsavedChanges(true);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'front' | 'back' | 'selfie' | 'proof_of_address') => {
    const file = e.target.files?.[0];
    if (!file || !selectedDoc) return;

    // Validate file type
    const acceptedTypes = field === 'selfie' ? ['image/jpeg', 'image/png'] : selectedDoc.acceptedFiles;
    if (!acceptedTypes.includes(file.type)) {
      setError(`Please upload a ${acceptedTypes.map((t) => t.split('/')[1].toUpperCase()).join(' or ')} file.`);
      return;
    }

    // Validate file size (5MB)
    if (selectedDoc.maxFileSize && file.size > selectedDoc.maxFileSize) {
      setError(`File size exceeds the maximum allowed size of ${selectedDoc.maxFileSize / (1024 * 1024)}MB`);
      return;
    }

    // Clean up existing preview
    if ((field === 'front' || field === 'proof_of_address') && documentPreview) URL.revokeObjectURL(documentPreview);
    if (field === 'selfie' && selfiePreview) URL.revokeObjectURL(selfiePreview);

    // Set file and preview
    if (field === 'front') {
      setFrontFile(file);
      setDocumentPreview(URL.createObjectURL(file));
    } else if (field === 'back') {
      setBackFile(file);
      setDocumentPreview(URL.createObjectURL(file));
    } else if (field === 'selfie') {
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
      setStep('review');
    } else if (field === 'proof_of_address') {
      setProofFile(file);
      setDocumentPreview(URL.createObjectURL(file));
      setStep('review');
    }

    setError(null);
    setHasUnsavedChanges(true);

    // Move to next step
    if (field === 'front' && selectedDoc.requiredFields.includes('back') && !backFile) {
      // Wait for back file
    } else if (field === 'front' || field === 'back') {
      setStep('selfie');
      if (cameraAvailable) {
        startCamera();
      }
    }
  };

  // Submit documents
  const handleSubmit = async () => {
    if (!selectedDoc || (!frontFile && !proofFile) || (selectedDoc.id === 'id_front' && !backFile) || (selectedDoc.requiredFields.includes('selfie') && !selfieFile)) {
      setError('Please complete all required documents.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userId = tempUserId ?? (user?.user_id !== undefined ? user.user_id.toString() : undefined);
      const isTempUser = !!tempUserId;

      if (!userId) {
        throw new Error('User identification is missing');
      }

      // Upload documents based on selected type
      if (selectedDoc.id === 'id_front') {
        if (frontFile) {
          await uploadKycDocument(token || '', userId, frontFile, 'id_front', undefined, isTempUser);
        }
        if (backFile) {
          await uploadKycDocument(token || '', userId, backFile, 'id_back', undefined, isTempUser);
        }
        if (selfieFile) {
          await uploadKycDocument(token || '', userId, selfieFile, 'selfie', undefined, isTempUser);
        }
      } else if (selectedDoc.id === 'proof_of_address' && proofFile) {
        await uploadKycDocument(token || '', userId, proofFile, 'proof_of_address', undefined, isTempUser);
      }

      // Update status with both user ID and temp user ID if available
      const statusParams: { userId?: string; tempUserId?: string } = {};
      
      if (user?.id) {
        statusParams.userId = user.id.toString();
      }
      
      if (tempUserId) {
        statusParams.tempUserId = tempUserId;
      }
      
      const updatedStatus = await getKycStatus(statusParams);
      setKycStatus(updatedStatus);
      setHasUnsavedChanges(false);
      setStep('status');
      onVerificationComplete('success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit documents. Please try again.';
      setError(errorMessage);
      console.error('KYC submission error:', err);
      onVerificationComplete('failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close with confirmation
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        cleanupResources();
        onClose();
      }
    } else {
      cleanupResources();
      onClose();
    }
  };

  // Progress bar
  const steps = ['Select', 'Upload', 'Selfie', 'Proof', 'Review', 'Status'];
  const currentStepIndex = steps.indexOf(step.charAt(0).toUpperCase() + step.slice(1));

  // Render error with retry or fallback
  const renderError = (message: string) => (
    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg" role="alert">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="mb-2" dangerouslySetInnerHTML={{ __html: message }} />
          <div className="flex gap-2">
            {cameraAvailable && step === 'selfie' && (
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm font-medium flex items-center gap-2"
                aria-label="Retry camera access"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retry Camera
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render step content
  const renderStep = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Select Document Type</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {DOCUMENT_TYPES.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentSelect(doc)}
                  className="p-4 border rounded-lg hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
                  aria-label={`Select ${doc.name} for KYC verification`}
                >
                  <h3 className="font-medium">{doc.name}</h3>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Upload {selectedDoc?.requiredFields.includes('back') && frontFile ? 'Back of' : 'Front of'}{' '}
              {selectedDoc?.name}
            </h2>
            <p className="text-sm text-gray-600">
              Upload your {selectedDoc?.name} in{' '}
              {selectedDoc?.acceptedFiles.map((t) => t.split('/')[1].toUpperCase()).join(', ')} format.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept={selectedDoc?.acceptedFiles.join(',')}
                onChange={(e) => handleFileChange(e, frontFile ? 'back' : 'front')}
                className="hidden"
                id="document-upload"
                aria-label={`Upload ${frontFile ? 'back' : 'front'} of ${selectedDoc?.name}`}
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="w-10 h-10 text-gray-400" aria-hidden="true" />
                <span>Click to upload or drag and drop</span>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedDoc ? `Max ${selectedDoc.maxFileSize / (1024 * 1024)}MB` : ''}
                </p>
              </label>
            </div>

            {documentPreview && (
              <img
                src={documentPreview}
                alt={`${frontFile ? 'Back' : 'Front'} of ${selectedDoc?.name} preview`}
                className="max-h-40 w-auto mx-auto border rounded-lg shadow-sm object-contain"
              />
            )}
            {error && renderError(error)}
          </div>
        );

      case 'selfie':
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Take Selfie</h2>
            <p className="text-sm text-gray-600">Take a clear selfie with your face visible.</p>

            {cameraAvailable && (
              <div className="relative w-full max-w-md mx-auto border rounded-lg overflow-hidden bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                ></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {cameraAvailable && (
                <button
                  onClick={captureSelfie}
                  disabled={isLoading || !frontFile}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Capture selfie with camera"
                >
                  {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : 'Capture Selfie'}
                </button>
              )}
              <label
                htmlFor="selfie-upload"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 cursor-pointer"
                aria-label="Upload selfie file"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload Selfie
                <input
                  type="file"
                  id="selfie-upload"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, 'selfie')}
                  className="hidden"
                />
              </label>
            </div>

            {error && renderError(error)}
          </div>
        );

      case 'proof':
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Upload Proof of Address</h2>
            <p className="text-sm text-gray-600">
              Upload your proof of address in{' '}
              {selectedDoc?.acceptedFiles.map((t) => t.split('/')[1].toUpperCase()).join(', ')} format.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept={selectedDoc?.acceptedFiles.join(',')}
                onChange={(e) => handleFileChange(e, 'proof_of_address')}
                className="hidden"
                id="proof-upload"
                aria-label="Upload proof of address"
              />
              <label
                htmlFor="proof-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="w-10 h-10 text-gray-400" aria-hidden="true" />
                <span>Click to upload or drag and drop</span>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedDoc ? `Max ${selectedDoc.maxFileSize / (1024 * 1024)}MB` : ''}
                </p>
              </label>
            </div>

            {documentPreview && (
              <img
                src={documentPreview}
                alt="Proof of address preview"
                className="max-h-40 w-auto mx-auto border rounded-lg shadow-sm object-contain"
              />
            )}
            {error && renderError(error)}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Review Submission</h2>
            <p className="text-sm text-gray-600">Verify that all documents are clear before submitting.</p>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{selectedDoc?.name}</h3>
                {documentPreview && (
                  <img
                    src={documentPreview}
                    alt={`${selectedDoc?.name} preview`}
                    className="max-h-80 w-auto mx-auto border rounded-lg shadow-sm object-contain"
                  />
                )}
              </div>
              {selfiePreview && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Selfie</h3>
                  <img
                    src={selfiePreview}
                    alt="Selfie preview"
                    className="max-h-80 w-auto mx-auto border rounded-lg shadow-sm object-contain"
                  />
                </div>
              )}
            </div>

            {error && renderError(error)}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  if (selectedDoc?.requiredFields.includes('selfie')) {
                    setStep('selfie');
                    if (cameraAvailable) startCamera();
                  } else {
                    setStep('proof');
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                aria-label="Edit documents"
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Submit KYC documents"
              >
                {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : 'Submit'}
              </button>
            </div>
          </div>
        );

      case 'status':
        return (
          <div className="text-center space-y-6">
            {kycStatus?.status === 'pending' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto text-yellow-500 animate-spin" aria-hidden="true" />
                <h2 className="text-xl font-bold">Verification Pending</h2>
                <p className="text-gray-600">Your documents are being reviewed. This may take a few days.</p>
              </>
            )}
            {kycStatus?.status === 'approved' && (
              <>
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" aria-hidden="true" />
                <h2 className="text-xl font-bold">Verification Approved</h2>
                <p className="text-gray-600">Your KYC verification has been successfully completed.</p>
              </>
            )}
            {kycStatus?.status === 'rejected' && (
              <>
                <XCircle className="w-16 h-16 mx-auto text-red-500" aria-hidden="true" />
                <h2 className="text-xl font-bold">Verification Rejected</h2>
                <p className="text-gray-600">
                  Your documents were not accepted.{' '}
                  {kycStatus?.next_steps?.length ? `Reason: ${kycStatus.next_steps.join(', ')}` : 'Please try again or contact support.'}
                </p>
                <button
                  onClick={() => {
                    setStep('select');
                    setFrontFile(null);
                    setBackFile(null);
                    setSelfieFile(null);
                    setProofFile(null);
                    setSelectedDoc(null);
                    setKycStatus(null);
                    setDocumentPreview(null);
                    setSelfiePreview(null);
                    setHasUnsavedChanges(false);
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Try Again
                </button>
              </>
            )}
            {kycStatus?.status === 'not_started' && (
              <>
                <AlertTriangle className="w-16 h-16 mx-auto text-red-500" aria-hidden="true" />
                <h2 className="text-xl font-bold">Verification Not Started</h2>
                <p className="text-gray-600">Please start the KYC verification process.</p>
                <button
                  onClick={() => setStep('select')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  aria-label="Start KYC verification"
                >
                  Start Verification
                </button>
              </>
            )}
            {kycStatus?.status === 'in_progress' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto text-yellow-500 animate-spin" aria-hidden="true" />
                <h2 className="text-xl font-bold">Verification In Progress</h2>
                <p className="text-gray-600">Your documents are being processed. Please check back later.</p>
              </>
            )}
            {kycStatus?.status === 'expired' && (
              <>
                <AlertTriangle className="w-16 h-16 mx-auto text-red-500" aria-hidden="true" />
                <h2 className="text-xl font-bold">Verification Expired</h2>
                <p className="text-gray-600">Your KYC verification has expired. Please restart the process.</p>
                <button
                  onClick={() => {
                    setStep('select');
                    setFrontFile(null);
                    setBackFile(null);
                    setSelfieFile(null);
                    setProofFile(null);
                    setSelectedDoc(null);
                    setKycStatus(null);
                    setDocumentPreview(null);
                    setSelfiePreview(null);
                    setHasUnsavedChanges(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  aria-label="Restart KYC verification"
                >
                  Restart Verification
                </button>
              </>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              aria-label="Close KYC verification"
            >
              Close
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Block rendering if not authenticated (unless tempUserId is provided)
  if (!tempUserId && (!user || !token)) {
    return (
      <div className="text-center p-6" role="alert">
        <p className="text-red-600">Please log in to proceed with KYC verification.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 rounded-xl min-h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">KYC Verification</h1>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close KYC verification"
        >
          <XCircle className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs sm:text-sm text-gray-600 flex-wrap gap-2">
          {steps.map((s, i) => (
            <span
              key={s}
              className={`font-medium ${i <= currentStepIndex ? 'text-red-600' : ''}`}
              aria-current={i === currentStepIndex ? 'step' : undefined}
            >
              {s}
            </span>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1">{renderStep()}</div>
    </div>
  );
};

export default KycVerification;