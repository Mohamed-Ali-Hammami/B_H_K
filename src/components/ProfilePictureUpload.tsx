'use client';

import React from 'react';
import Image from 'next/image';

interface ProfilePictureUploadProps {
  onProfilePictureChange: (image: string) => void;
  onRemoveImage: () => void;
  imagePreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  onProfilePictureChange,
  onRemoveImage,
  imagePreview,
  fileInputRef,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onProfilePictureChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <label
        htmlFor="profile-picture-upload"
        className="sr-only"
      >
        Upload Profile Picture
      </label>
      <div className="relative group">
        {imagePreview ? (
          <div className="relative flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Image
                src={imagePreview}
                alt="Profile Picture Preview"
                fill
                sizes="128px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
            <button
              type="button"
              onClick={onRemoveImage}
              className="mt-3 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-300"
              aria-label="Remove profile picture"
            >
              Remove Image
            </button>
          </div>
        ) : (
          <label
            className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 border-4 border-gray-200 cursor-pointer hover:from-red-200 hover:to-red-300 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload profile picture"
            />
            <svg
              className="w-8 h-8 text-red-600 group-hover:text-red-700 transition-colors duration-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h4m0 0a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm6-2V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6m-6 0V5m6 2v14a2 2 0 01-2 2h-4a2 2 0 01-2-2V7"
              />
            </svg>
          </label>
        )}
      </div>
      {imagePreview && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-300"
          aria-label="Change profile picture"
        >
          Change Image
        </button>
      )}
    </div>
  );
};

export default ProfilePictureUpload;