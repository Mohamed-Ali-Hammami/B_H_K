import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { apiClient } from '../utils/utils_storage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type PaymentMethod = 'ETH' | 'USDT' | 'BTC';
type Currency = 'USD' | 'HKD';

interface DepositFundsProps {
  isOpen: boolean;
  setIsDepositModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}

const DepositFunds: React.FC<DepositFundsProps> = ({ isOpen, setIsDepositModalOpen, onClose }) => {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
  const ETH_RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS ?? '';
  const BTC_RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_BTC_RECIEVER_ADDRESS ?? '';
  const USDT_RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_USDT_RECIEVER_ADDRESS ?? '';

  const [transactionHash, setTransactionHash] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ETH');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [conversionRates, setConversionRates] = useState<{ [key in PaymentMethod]: { USD: number; HKD: number } }>({
    ETH: { USD: 0, HKD: 0 },
    USDT: { USD: 0, HKD: 0 },
    BTC: { USD: 0, HKD: 0 },
  });
  const [usdToHkdRate, setUsdToHkdRate] = useState<number>(7.85); // Default fallback rate
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const MINIMUM_DEPOSIT_USD = 50;

  const getSessionToken = () => localStorage.getItem("token");

  const getReceiverAddress = (method: PaymentMethod): string => {
    switch (method) {
      case 'ETH':
        return ETH_RECEIVER_ADDRESS;
      case 'USDT':
        return USDT_RECEIVER_ADDRESS;
      case 'BTC':
        return BTC_RECEIVER_ADDRESS;
      default:
        return '';
    }
  };

  const receiverAddress = getReceiverAddress(paymentMethod);

  const fetchConversionRates = async () => {
    try {
      setIsLoading(true);
      const [cryptoRates, fiatRates] = await Promise.all([
        apiClient('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,bitcoin&vs_currencies=usd,hkd'),
        apiClient('https://api.exchangerate-api.com/v4/latest/USD'), // Using a reliable fiat exchange rate API
      ]);

      setConversionRates({
        ETH: { USD: cryptoRates.ethereum.usd || 0, HKD: cryptoRates.ethereum.hkd || 0 },
        USDT: { USD: cryptoRates.tether.usd || 0, HKD: cryptoRates.tether.hkd || 0 },
        BTC: { USD: cryptoRates.bitcoin.usd || 0, HKD: cryptoRates.bitcoin.hkd || 0 },
      });

      setUsdToHkdRate(fiatRates.rates.HKD || 7.85);
    } catch (err) {
      setError('Failed to fetch live conversion rates');
      toast.error('Failed to fetch live conversion rates', { position: 'top-right' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckTransactionStatus = async () => {
    const token = getSessionToken();
    if (!token) {
      setError('Please log in to proceed.');
      toast.error('Please log in to proceed.', { position: 'top-right' });
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        tx_hash: transactionHash,
        payment_method: paymentMethod,
      };

      const response = await apiClient(`${apiUrl}/api/transaction-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const { from, status, tanacoin_purchased, to, type } = response;

      toast.success(
        `Transaction successful:\nFrom: ${from}\nTo: ${to}\nType: ${type}\nStatus: ${status}\nAmount: ${tanacoin_purchased} ${currency}`,
        { position: 'top-right', autoClose: 5000 }
      );
    } catch (err) {
      setError('Failed to verify transaction');
      toast.error('Failed to verify transaction', { position: 'top-right' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchConversionRates();
    const intervalId = setInterval(fetchConversionRates, 300000); // Update every 5 minutes for live rates

    return () => clearInterval(intervalId);
  }, [isOpen]);

  useEffect(() => {
    if (!depositAmount || !conversionRates[paymentMethod][currency]) return;

    const convertedAmount = depositAmount / conversionRates[paymentMethod][currency];
    setPaymentAmount(convertedAmount || 0);
  }, [depositAmount, paymentMethod, currency, conversionRates]);

  const getMinimumDeposit = (): number => {
    return currency === 'USD' ? MINIMUM_DEPOSIT_USD : MINIMUM_DEPOSIT_USD * usdToHkdRate;
  };

  const handleDepositAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value);

    if (isNaN(numericValue)) {
      setDepositAmount(0);
      return;
    }

    const minDeposit = getMinimumDeposit();
    if (numericValue < minDeposit) {
      toast.warn(`Minimum deposit is ${minDeposit.toFixed(2)} ${currency}`, { position: 'top-right' });
      setDepositAmount(minDeposit);
    } else {
      setDepositAmount(numericValue);
    }
  };

  const handleCopyToClipboard = () => {
    if (receiverAddress) {
      navigator.clipboard.writeText(receiverAddress);
      toast.success('Address copied to clipboard!', { position: 'top-right' });
    } else {
      setError('No receiver address available');
      toast.error('No receiver address available', { position: 'top-right' });
    }
  };

  const handleClose = () => {
    if (setIsDepositModalOpen) setIsDepositModalOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  const minDeposit = getMinimumDeposit();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 sm:p-8 transform transition-all duration-300">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
          onClick={handleClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Deposit Funds</h2>

        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg text-center mb-6">{error}</p>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Select Currency
              </label>
              <select
                id="currency"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                <option value="USD">USD</option>
                <option value="HKD">HKD</option>
              </select>
            </div>

            <div>
              <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount ({currency})
              </label>
              <div className="relative">
                <input
                  id="depositAmount"
                  type="number"
                  min={minDeposit}
                  value={depositAmount}
                  onChange={handleDepositAmountChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  placeholder={`Minimum ${minDeposit.toFixed(2)} ${currency}`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500">
                  ⚠
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum deposit: {minDeposit.toFixed(2)} {currency}
              </p>
            </div>

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="ETH">ETH</option>
                <option value="USDT">USDT (ERC20)</option>
                <option value="BTC">BTC (SegWit)</option>
              </select>
            </div>

            <div className="text-center">
              <p className="text-red-600 font-semibold text-sm">
                Amount to Pay ({paymentMethod}): {paymentAmount.toFixed(10)} {paymentMethod}
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-gray-600">
                Scan or copy the address below to send your {paymentMethod} payment
              </p>
              {receiverAddress && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <QRCodeSVG value={receiverAddress} size={160} />
                </div>
              )}
              <button
                type="button"
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                onClick={handleCopyToClipboard}
              >
                Copy Address
              </button>
              <p className="text-xs text-gray-500 text-center">
                Deposits below {minDeposit.toFixed(2)} {currency} will not be credited.
              </p>
            </div>

            <div className="space-y-4">
              <label htmlFor="transactionHash" className="block text-sm font-medium text-gray-700">
                Enter Transaction Hash
              </label>
              <input
                id="transactionHash"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                placeholder="Paste your transaction hash here"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
              />
              <button
                className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={handleCheckTransactionStatus}
                disabled={isLoading || !transactionHash}
              >
                {isLoading ? 'Verifying...' : 'Check Transaction Status'}
              </button>
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      </div>
    </div>
  );
};

export default DepositFunds;