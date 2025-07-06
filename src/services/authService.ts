const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  id_type?: 'passport' | 'id_card' | 'driving_license';
  id_number?: string;
  temp_user_id?: string;
  agreeToTerms?: boolean;
  dialCode?: string;
}

interface KycDocumentData {
  document: File;
  document_type: 'id_front' | 'id_back' | 'selfie' | 'proof_of_address' | 'other';
}

// Map frontend document types to backend KYC document types
const mapDocumentType = (frontendType: string): KycDocumentData['document_type'] => {
  switch (frontendType) {
    case 'PASSPORT':
      return 'id_front';
    case 'ID_CARD':
      return 'id_front';
    case 'DRIVING_LICENSE':
      return 'id_front';
    case 'SELFIE':
      return 'selfie';
    default:
      return 'other';
  }
};

export const login = async (credentials: LoginCredentials) => {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
};

export const register = async (userData: RegisterData) => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
};

export const logout = async (token: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }
  } catch (error) {
    console.error('Logout API error:', error);
    // Proceed with client-side cleanup even if API call fails
  }
};

export const verifyEmail = async (token: string) => {
  const response = await fetch(`${API_URL}/api/confirm-email/${token}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Email verification failed');
  }

  return response.json();
};

export const requestPasswordReset = async (email: string) => {
  const response = await fetch(`${API_URL}/api/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Password reset request failed');
  }

  return response.json();
};

export const resetPassword = async (token: string, password: string) => {
  const response = await fetch(`${API_URL}/api/reset-password/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Password reset failed');
  }

  return response.json();
};

export interface KycDocument {
  document_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  verified_by?: number;
  file_path?: string;
}

export interface KycStatus {
  status: 'not_started' | 'in_progress' | 'pending' | 'approved' | 'rejected';
  documents: KycDocument[];
  required_documents: string[];
  next_steps?: string[];
}

interface KycStatusParams {
  userId?: string;
  tempUserId?: string;
}

interface KycStatusResponse {
  status: 'not_started' | 'in_progress' | 'pending' | 'approved' | 'rejected';
  documents: KycDocument[];
  required_documents: string[];
  next_steps?: string[];
}

export const getKycStatus = async (params: KycStatusParams | string): Promise<KycStatusResponse> => {
  try {
    // Handle backward compatibility with string userId
    const userId = typeof params === 'string' ? params : params.userId;
    const tempUserId = typeof params === 'string' ? undefined : params.tempUserId;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (userId) queryParams.append('user_id', userId);
    if (tempUserId) queryParams.append('temp_user_id', tempUserId);
    
    const url = `${API_URL}/api/kyc/status?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch KYC status');
    }

    const data = await response.json();

    // Determine required documents based on the user's country/region
    // This should be dynamically determined based on user's location
    const requiredDocuments = ['id_front', 'selfie', 'proof_of_address'];
    
    // Determine next steps based on current status and documents
    const nextSteps: string[] = [];
    const { status, documents = [] } = data;
    
    if (status === 'not_started') {
      nextSteps.push('Upload a government-issued ID');
    } else if (status === 'in_progress') {
      const uploadedTypes = documents.map((doc: any) => doc.document_type);
      
      if (!uploadedTypes.includes('id_front')) {
        nextSteps.push('Upload the front of your ID');
      }
      if (!uploadedTypes.includes('selfie')) {
        nextSteps.push('Upload a selfie');
      }
      if (!uploadedTypes.includes('proof_of_address')) {
        nextSteps.push('Upload a proof of address');
      }
    } else if (status === 'pending') {
      nextSteps.push('Your documents are under review');
      nextSteps.push('Check back later for updates');
    } else if (status === 'rejected') {
      const rejectedDocs = documents.filter((doc: any) => doc.status === 'rejected');
      if (rejectedDocs.length > 0) {
        nextSteps.push('Some documents were rejected. Please re-upload them.');
        rejectedDocs.forEach((doc: any) => {
          if (doc.rejection_reason) {
            nextSteps.push(`- ${doc.document_type}: ${doc.rejection_reason}`);
          }
        });
      }
    }

    return {
      ...data,
      required_documents: requiredDocuments,
      next_steps: nextSteps,
    };
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    throw new Error('Failed to fetch KYC status');
  }
};

export const getKycDocumentUrl = (documentPath: string): string => {
  if (!documentPath) return '';
  // This should be replaced with your actual document access endpoint
  return `${API_URL}/api/kyc/documents/${encodeURIComponent(documentPath)}`;
};

export const uploadKycDocument = async (
  token: string = '',
  userId: string,
  document: File,
  documentType: string,
  selfie?: File,
  isTempUser: boolean = true
): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData();
  formData.append('file', document); // Backend expects 'file' for the document
  formData.append('document_type', documentType);
  formData.append('user_id', userId); // Backend expects 'user_id'
  // No need to send isTempUser; backend logic infers from user_id
  // If selfie is provided and it's not the main document, skip (handled by separate call)

  try {
    const response = await fetch(`${API_URL}/kyc/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify KYC documents');
    }

    return { success: true, message: 'KYC verification submitted successfully' };
  } catch (error) {
    console.error('Error during KYC verification:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to complete KYC verification');
  }
};