'use client';
import React, { useState } from 'react';

interface ContactUsFormProps {
  onClose: () => void; // Prop pour gérer la fermeture du formulaire
}

const ContactUsForm: React.FC<ContactUsFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState({
    emailValid: true,
    submissionError: false,
  });

  // Fonction de validation d'email
  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Gère les changements des champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(''); // Réinitialiser le message d'état

    const emailValid = validateEmail(formData.email);
    setErrors({
      emailValid,
      submissionError: false,
    });

    if (emailValid) {
      try {
        const response = await fetch(`${apiUrl}/api/contact-us`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setFormData({
            name: '',
            email: '',
            message: '',
          });
          setStatusMessage('Message envoyé avec succès !'); // Message de succès
          // Attendez quelques secondes avant de fermer le formulaire
          setTimeout(() => {
            onClose();
          }, 5000);
        } else {
          const data = await response.json();
          setErrors((prev) => ({
            ...prev,
            submissionError: true,
          }));
          setStatusMessage(data.message || 'Échec de l\'envoi du message. Veuillez réessayer.'); // Message d'erreur
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        setErrors((prev) => ({
          ...prev,
          submissionError: true,
        }));
        setStatusMessage('Une erreur s\'est produite. Veuillez réessayer plus tard.'); // Message d'erreur
      }
    } else {
      setErrors((prev) => ({
        ...prev,
        emailValid: false,
      }));
      setStatusMessage('Veuillez entrer une adresse email valide.'); // Message d'erreur email
    }

    setIsLoading(false);
  };

  return (
    <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full mx-auto shadow-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Envoyez-nous un message</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Votre nom"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <div>
          <input
            type="email"
            name="email"
            placeholder="Votre email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
              !errors.emailValid ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {!errors.emailValid && (
            <p className="mt-1 text-sm text-red-600">Format d&apos;email invalide</p>
          )}
        </div>
        
        <div>
          <textarea
            name="message"
            placeholder="Votre message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
              errors.submissionError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="relative">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </>
            ) : (
              'ENVOYER LE MESSAGE'
            )}
          </button>
        </div>
      </form>
      
      {statusMessage && (
        <div className={`mt-4 p-4 rounded-lg text-center ${
          errors.submissionError || !errors.emailValid 
            ? 'bg-red-50 text-red-700' 
            : 'bg-green-50 text-green-700'
        }`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default ContactUsForm;
