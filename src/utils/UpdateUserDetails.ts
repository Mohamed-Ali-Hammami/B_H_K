// src/utils/updateUserDetails.ts

interface UpdateUserDetails {
  email?: string;
  newPassword?: string;
  profilePicture?: File | string;
}

interface UpdateResponse {
  message: string;
  success: boolean;
}

export async function updateUserDetails(
  data: UpdateUserDetails,
  token: string
): Promise<UpdateResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const requestBody: UpdateUserDetails = {
      ...data,
      profilePicture: data.profilePicture instanceof File 
        ? await convertFileToBase64(data.profilePicture) 
        : data.profilePicture
    };

    const response = await fetch(`${apiUrl}/dashboard/data`, {
      method: 'PUT',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        message: errorData.message || 'Failed to update user details', 
        success: false 
      };
    }

    const result = await response.json();
    return { 
      message: result.message || 'User  details updated successfully', 
      success: true 
    };

  } catch (error) {
    console.error('Error updating user details:', error);
    return { 
      message: error instanceof Error ? error.message : 'Failed to update user details', 
      success: false 
    };
  }
}

// Helper function to convert File to base64
async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}