'use client';

import React, { useState, useCallback, useRef } from 'react';
import { UpdateData } from '../../src/utils/types';
import ProfilePictureUpload from './ProfilePictureUpload';

interface CombinedFormProps {
  onUpdate: (updateData: UpdateData) => void;
  onClose: () => void;
  action: 'changePassword' | 'changeEmail' | 'changeProfilePicture' | null;
  viewOnly?: boolean;
  children?: React.ReactNode;
}

const CombinedForm: React.FC<CombinedFormProps> = ({
  onUpdate,
  onClose,
  action,
  viewOnly,
  children,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    phone_number: '',
    newPassword: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (viewOnly || isSubmitting) return;

      setIsSubmitting(true);
      let updateData: UpdateData;

      try {
        switch (action) {
          case 'changeProfilePicture':
            if (!imagePreview) {
              alert('Please select a profile picture');
              return;
            }
            updateData = { profilePicture: imagePreview };
            break;

          case 'changeEmail':
            if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
              alert('Please enter a valid email address');
              return;
            }
            updateData = { email: formData.email };
            break;

          case 'changePassword':
            if (formData.newPassword.length < 8) {
              alert('Password must be at least 8 characters long');
              return;
            }
            updateData = { newPassword: formData.newPassword };
            break;

          default:
            throw new Error(`Unsupported action: ${action}`);
        }

        await onUpdate(updateData);
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [action, formData, imagePreview, viewOnly, onUpdate, isSubmitting]
  );

  const removeImage = useCallback(() => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const getFormTitle = () => {
    switch (action) {
      case 'changeProfilePicture':
        return 'Update Profile Picture';
      case 'changeEmail':
        return 'Update Email Address';
      case 'changePassword':
        return 'Change Password';
      default:
        return 'Update Information';
    }
  };

  const renderFormSection = () => {
    switch (action) {
      case 'changeProfilePicture':
        return (
          <div className="space-y-4">
            <ProfilePictureUpload
              onProfilePictureChange={setImagePreview}
              onRemoveImage={removeImage}
              imagePreview={imagePreview}
              fileInputRef={fileInputRef}
            />
          </div>
        );
      case 'changeEmail':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                New Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter new email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={viewOnly || isSubmitting}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300"
              />
            </div>
          </div>
        );
      case 'changePassword':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                minLength={8}
                disabled={viewOnly || isSubmitting}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300"
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{getFormTitle()}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
            aria-label="Close form"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {children}
          {renderFormSection()}

          {( action === 'changeEmail' ||
            action === 'changePassword' || action === 'changeProfilePicture') && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  isSubmitting
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CombinedForm;