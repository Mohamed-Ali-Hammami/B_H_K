import React from 'react';

interface Transaction {
  transaction_id: number;
  amount: string;
  transaction_date: string;
  status: string;
  recipient_tnc_wallet_id: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
  onClose: () => void;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions,onClose }) => {
  if (transactions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow p-6 flex flex-col items-center">

        <p className="text-gray-500 mt-4">Vous n&apos;avez aucune transaction</p>
      </div>
    );
  }

  // Remove duplicates based on transaction_id
  const uniqueTransactions = transactions.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.transaction_id === value.transaction_id
    ))
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Transactions List</h3>

      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient Wallet ID</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {uniqueTransactions.map((transaction) => (
              <tr key={transaction.transaction_id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.transaction_id}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.amount}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={
                    `inline-block px-2 py-1 rounded-full text-xs font-semibold ` +
                    (transaction.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    transaction.status.toLowerCase() === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800')
                  }>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.recipient_tnc_wallet_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsList;
