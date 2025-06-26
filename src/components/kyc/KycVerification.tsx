'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadKycDocument } from '../../services/authService';

// Define supported document types
interface DocumentType {
  id: string;
  name: string;
  description: string;
  requiredFields: ('front' | 'back' | 'selfie')[];
  acceptedFiles: string[];
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'passport',
    name: 'Passport',
    description: 'Upload a clear photo of your passport.',
    requiredFields: ['front', 'selfie'],
    acceptedFiles: ['image/jpeg', 'image/png'],
  },
  {
    id: 'id_front',
    name: 'ID Card',
    description: 'Upload front and back of your government-issued ID card.',
    requiredFields: ['front', 'back', 'selfie'],
    acceptedFiles: ['image/jpeg', 'image/png', 'application/pdf'],
  },
];

const KycVerification: React.FC<{
  onVerificationComplete: (status: 'success' | 'failed') => void;
  onClose: () => void;
  tempUserId?: string;
}> = ({ onVerificationComplete, onClose, tempUserId }) => {
  const { user, token } = useAuth();

  const [step, setStep] = useState<'select' | 'upload' | 'selfie' | 'review' | 'complete'>('select');
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

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

  // Check camera permission status
  const checkCameraPermission = async (): Promise<boolean> => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return true; // Fallback to direct request if permissions API is unavailable
    }
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return permission.state === 'granted';
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
      setError('Your browser does not support camera access. Please upload a selfie file instead.');
      setIsLoading(false);
      return;
    }

    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      setError(
        'Camera access is required. Please allow camera access in your browser settings and retry. ' +
        '<a href="https://support.google.com/chrome/answer/2693767" target="_blank" class="underline">Learn how</a>.'
      );
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
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
        errorMessage += 'Please allow camera access in your browser settings. <a href="https://support.google.com/chrome/answer/2693767" target="_blank" class="underline">Learn how</a>.';
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
    setStep('upload');
    setHasUnsavedChanges(true);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'front' | 'back' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file || !selectedDoc) return;

    // Validate file type
    const acceptedTypes = field === 'selfie' ? ['image/jpeg', 'image/png'] : selectedDoc.acceptedFiles;
    if (!acceptedTypes.includes(file.type)) {
      setError(`Please upload a ${acceptedTypes.map((t) => t.split('/')[1].toUpperCase()).join(' or ')} file.`);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    // Clean up existing preview
    if (field === 'front' && documentPreview) URL.revokeObjectURL(documentPreview);
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
    }

    setError(null);
    setHasUnsavedChanges(true);

    // Move to next step
    if (field === 'front' && selectedDoc.requiredFields.includes('back') && !backFile) {
      // Wait for back file
    } else if (field !== 'selfie') {
      setStep('selfie');
      if (cameraAvailable) {
        startCamera();
      }
    }
  };

  // Submit documents
  const handleSubmit = async () => {
    if (!selectedDoc || !frontFile || !selfieFile || (selectedDoc.id === 'id_front' && !backFile)) {
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

      // Upload front document
      await uploadKycDocument(token, userId, frontFile, selectedDoc.id, selfieFile, isTempUser);

      // Upload back document if required
      if (selectedDoc.id === 'id_front' && backFile) {
        await uploadKycDocument(token, userId, backFile, 'id_back', selfieFile, isTempUser);
      }

      // Upload selfie
      await uploadKycDocument(token, userId, selfieFile, 'selfie', selfieFile, isTempUser);

      setHasUnsavedChanges(false);
      onVerificationComplete('success');
      setStep('complete');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to submit documents. Please try again.';
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
  const steps = ['Select', 'Upload', 'Selfie', 'Review', 'Complete'];
  const currentStepIndex = steps.indexOf(
    step.charAt(0).toUpperCase() + step.slice(1)
  );

  // Render error with retry or fallback
  const renderError = (message: string) => (
    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
      <div className="flex items-start gap-2">
        <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="mb-2" dangerouslySetInnerHTML={{ __html: message }} />
          <div className="flex gap-2">
            {cameraAvailable && (
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium flex items-center gap-2"
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
            <h2 className="text-2xl font-semibold text-gray-900">Select Document Type</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {DOCUMENT_TYPES.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentSelect(doc)}
                  className="p-4 border rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
            <h2 className="text-2xl font-semibold text-gray-900">
              Upload {selectedDoc?.requiredFields.includes('back') && frontFile ? 'Back of' : ''}{' '}
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
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="w-10 h-10 text-gray-400" />
                <span>Click to upload or drag and drop</span>
                <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
              </label>
            </div>

            {documentPreview && (
              <img
                src={documentPreview}
                alt="Document preview"
                className="max-h-40 w-auto mx-auto border rounded-lg shadow-sm"
              />
            )}
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
        );

      case 'selfie':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Take Selfie</h2>
            <p className="text-sm text-gray-600">Take a clear selfie with your face visible.</p>

            {cameraAvailable && (
              <div className="relative w-full max-w-md mx-auto border rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                ></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
            )}

            <div className="flex justify-center gap-4">
              {cameraAvailable && (
                <button
                  onClick={captureSelfie}
                  disabled={isLoading || !frontFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Capture Selfie'}
                </button>
              )}
              <label
                htmlFor="selfie-upload"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
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

      case 'review':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Review Submission</h2>
            <p className="text-sm text-gray-600">Verify that all documents are clear before submitting.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{selectedDoc?.name}</h3>
                {documentPreview && (
                  <img
                    src={documentPreview}
                    alt="Document preview"
                    className="max-h-80 w-auto mx-auto border rounded-lg shadow-sm"
                  />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Selfie</h3>
                {selfiePreview && (
                  <img
                    src={selfiePreview}
                    alt="Selfie preview"
                    className="max-h-80 w-auto mx-auto border rounded-lg shadow-sm"
                  />
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setStep('selfie');
                  if (cameraAvailable) startCamera();
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Submit'}
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h2 className="text-xl font-bold">Submitted Successfully!</h2>
            <p className="text-gray-600">Your documents are being reviewed manually.</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
      <div className="text-center p-6">
        <p className="text-red-500">Please log in to proceed with KYC verification.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600">
          {steps.map((s, i) => (
            <span
              key={s}
              className={`font-medium ${i <= currentStepIndex ? 'text-blue-600' : ''}`}
            >
              {s}
            </span>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {renderStep()}
    </div>
  );
};

export default KycVerification;