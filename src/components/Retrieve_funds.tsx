import React, { useState, useEffect } from 'react';

interface RetrieveFundsProps {
  onClose: () => void;
}

const RetrieveFunds: React.FC<RetrieveFundsProps> = ({ onClose }) => {
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const serviceLaunchDate = new Date("January 1, 2025 00:00:00").getTime();

    const countdownTimer = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = serviceLaunchDate - now;

      if (timeLeft <= 0) {
        setIsAvailable(true);
        clearInterval(countdownTimer);
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  const CountdownItem = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center px-4 py-3 bg-blue-50 rounded-lg">
      <span className="text-2xl font-bold text-blue-700">{value}</span>
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <span className="text-2xl">×</span>
      </button>
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isAvailable ? 'Funds Retrieval' : 'Service Coming Soon'}
        </h2>
        <p className="text-gray-600">
          {isAvailable 
            ? 'Funds retrieval service is now available.'
            : 'We are working hard to bring you secure funds retrieval.'}
        </p>
      </div>

      {!isAvailable && (
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">
            Service Launching In
          </h3>
          
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            <CountdownItem value={countdown.days} label="Days" />
            <CountdownItem value={countdown.hours} label="Hours" />
            <CountdownItem value={countdown.minutes} label="Minutes" />
            <CountdownItem value={countdown.seconds} label="Seconds" />
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-medium text-gray-800 mb-2">About Our Service</h3>
        <p className="text-sm text-gray-600">
          Our secure funds retrieval service will be available soon. We're implementing additional 
          security measures to ensure your transactions are safe and reliable.
        </p>
        
        {isAvailable && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              onClick={() => alert('Fund retrieval service will be available soon')}
            >
              Retrieve Funds
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetrieveFunds;
