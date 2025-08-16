import React from 'react';
import { Calculator, TrendingUp, Wallet } from 'lucide-react';
import { Participant, Bill } from '../types';

interface SummaryDisplayProps {
  participants: Participant[];
  amounts: { [key: number]: number };
  bills: Bill[];
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  participants,
  amounts,
  bills
}) => {
  const totalAmount = Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
  const averageAmount = participants.length > 0 ? totalAmount / participants.length : 0;

  // Sort participants by amount owed (descending)
  const sortedParticipants = [...participants].sort((a, b) => (amounts[b.id] || 0) - (amounts[a.id] || 0));

  if (participants.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="text-center py-8 text-gray-500">
          <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Summary will appear here</p>
          <p className="text-sm">Add participants and bills to see the breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
        </div>

        {bills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Add some bills to see the summary</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Total Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="text-green-600 text-sm font-medium mb-1">Total Amount</div>
                <div className="text-2xl font-bold text-green-700">₹{totalAmount.toFixed(2)}</div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="text-blue-600 text-sm font-medium mb-1">Average Per Person</div>
                <div className="text-2xl font-bold text-blue-700">₹{averageAmount.toFixed(2)}</div>
              </div>
            </div>

            {/* Individual Amounts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-800">Individual Breakdown</h3>
              </div>
              
              {sortedParticipants.map((participant, index) => {
                const amount = amounts[participant.id] || 0;
                const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
                
                return (
                  <div key={participant.id} className="relative">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/80 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                          'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}>
                          {index < 3 ? (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉') : participant.id}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{participant.name}</div>
                          <div className="text-sm text-gray-500">{percentage.toFixed(1)}% of total</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-800">₹{amount.toFixed(2)}</div>
                        {amount > averageAmount && (
                          <div className="text-xs text-red-600">+₹{(amount - averageAmount).toFixed(2)} above avg</div>
                        )}
                        {amount < averageAmount && (
                          <div className="text-xs text-green-600">-₹{(averageAmount - amount).toFixed(2)} below avg</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bill History */}
      {bills.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {bills.slice(-3).reverse().map((bill, index) => (
              <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg">
                <div className="text-sm text-gray-600">
                  Bill #{bills.length - index}
                </div>
                <div className="font-semibold text-gray-800">₹{bill.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryDisplay;