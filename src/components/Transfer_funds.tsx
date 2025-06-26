import React, { useState } from 'react';

interface TransferFundsProps {
  onClose: () => void;
}

const TransferFundsForm: React.FC<TransferFundsProps> = ({ onClose }) => {
  const [recipientRIB, setRecipientRIB] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!recipientRIB || !amount) {
      setErrorMessage('Please provide both recipient RIB and amount.');
      return;
    }

    const token = localStorage.getItem('token'); // Récupérer le jeton dans le stockage local

    if (!token) {
      setErrorMessage('Le jeton d\'authentification est manquant.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${apiUrl}/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Inclure le jeton dans l'en-tête d'autorisation
        },
        body: JSON.stringify({
          action: 'transfer',
          recipient_rib: recipientRIB,
          amount: parseFloat(amount),
          reference: reference || 'HK Bank Transfer',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message); // Afficher le message de succès en cas de succès
      } else {
        setErrorMessage(result.error || 'Une erreur est survenue lors du transfert.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Une erreur inattendue est survenue lors du traitement du transfert.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Transfer Funds</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <span className="text-2xl">×</span>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipientRIB" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient RIB
          </label>
          <input
            id="recipientRIB"
            type="text"
            value={recipientRIB}
            onChange={(e) => setRecipientRIB(e.target.value)}
            placeholder="Enter recipient's RIB"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (USD)
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
            Reference (Optional)
          </label>
          <input
            id="reference"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Payment reference"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <button 
          type="submit" 
          disabled={isProcessing}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${isProcessing ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {isProcessing ? 'Processing...' : 'Transfer Funds'}
        </button>
      </form>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default TransferFundsForm;
