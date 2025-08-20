import React, { useState } from 'react';
import { Plus, Receipt, Trash2, DollarSign, Pencil } from 'lucide-react';
import { Participant, Bill, BillSplit } from '../types';

interface BillManagerProps {
  participants: Participant[];
  bills: Bill[];
  onSaveBill: (bill: Bill) => void;
  onRemoveBill: (billId: string) => void;
  className?: string;
}

const BillManager: React.FC<BillManagerProps> = ({
  participants,
  bills,
  onSaveBill,
  onRemoveBill,
  className
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [splits, setSplits] = useState<BillSplit[]>([]);
  const [currentSplitAmount, setCurrentSplitAmount] = useState('');
  const [currentSplitDescription, setCurrentSplitDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'shares'>('equal');
  const [currentSplitShares, setCurrentSplitShares] = useState<{ [key: number]: number }>({});

  const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
  const remainingAmount = parseFloat(totalAmount || '0') - totalSplitAmount;

  const handleAddSplit = () => {
    const amount = parseFloat(currentSplitAmount);
    if (splitType === 'equal') {
      if (amount > 0 && selectedParticipants.length > 0 && amount <= remainingAmount) {
        setSplits([...splits, { amount, participantIds: [...selectedParticipants], description: currentSplitDescription }]);
        setCurrentSplitAmount('');
        setCurrentSplitDescription('');
        setSelectedParticipants([]);
      }
    } else if (splitType === 'shares') {
      const totalShares = Object.values(currentSplitShares).reduce((sum, share) => sum + share, 0);
      if (amount > 0 && totalShares > 0 && amount <= remainingAmount) {
        setSplits([...splits, { amount, shares: currentSplitShares, description: currentSplitDescription }]);
        setCurrentSplitAmount('');
        setCurrentSplitDescription('');
        setSelectedParticipants([]);
        setCurrentSplitShares({});
      }
    }
  };

  const handleRemoveSplit = (index: number) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const handleSubmitBill = () => {
    const total = parseFloat(totalAmount);
    if (total > 0) {
      const billToSave: Bill = {
        id: editingBillId || Date.now().toString(),
        total,
        splits,
        remainingAmount: Math.max(0, remainingAmount),
        createdAt: editingBillId ? bills.find(b => b.id === editingBillId)?.createdAt || new Date() : new Date(),
        description: description
      };
      onSaveBill(billToSave);

      // Reset form
      setTotalAmount('');
      setSplits([]);
      setCurrentSplitAmount('');
      setSelectedParticipants([]);
      setIsAdding(false);
      setDescription('');
      setCurrentSplitDescription('');
      setEditingBillId(null);
      setSplitType('equal'); // Reset split type
      setCurrentSplitShares({}); // Reset shares
    }
  };

  const toggleParticipant = (id: number) => {
    setSelectedParticipants(prev => {
      const newSelection = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      if (splitType === 'shares') {
        setCurrentSplitShares(prevShares => {
          const newShares = { ...prevShares };
          if (newSelection.includes(id)) {
            newShares[id] = newShares[id] || 1; // Default to 1 share if newly selected
          } else {
            delete newShares[id];
          }
          return newShares;
        });
      }
      return newSelection;
    });
  };

  const selectAllParticipants = () => {
    const allParticipantIds = participants.map(p => p.id);
    setSelectedParticipants(allParticipantIds);
    if (splitType === 'shares') {
      const newShares: { [key: number]: number } = {};
      allParticipantIds.forEach(id => {
        newShares[id] = currentSplitShares[id] || 1; // Keep existing shares or default to 1
      });
      setCurrentSplitShares(newShares);
    }
  };

  const handleEditBill = (billId: string) => {
    const billToEdit = bills.find(bill => bill.id === billId);
    if (billToEdit) {
      setEditingBillId(billId);
      setIsAdding(true);
      setTotalAmount(billToEdit.total.toString());
      setDescription(billToEdit.description);
      setSplits(billToEdit.splits);
      // For selected participants, we need to get all unique participant IDs from all splits
      const allSplitParticipantIds = new Set<number>();
      const initialShares: { [key: number]: number } = {};
      billToEdit.splits.forEach(split => {
        if (split.shares) {
          setSplitType('shares'); // If any split has shares, assume shares mode for editing
          for (const participantId in split.shares) {
            const id = Number(participantId);
            allSplitParticipantIds.add(id);
            initialShares[id] = split.shares[id];
          }
        } else {
          setSplitType('equal'); // Otherwise, assume equal mode
          split.participantIds.forEach(id => allSplitParticipantIds.add(id));
        }
      });
      setSelectedParticipants(Array.from(allSplitParticipantIds));
      setCurrentSplitShares(initialShares);
      setCurrentSplitAmount(''); // Clear current split input
      setCurrentSplitDescription(''); // Clear current split description
    }
  };

  if (participants.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="text-center py-8 text-gray-500">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Add participants first</p>
          <p className="text-sm">You need at least one participant to add bills</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Receipt className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Bills</h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Bill
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-green-50/80 rounded-xl border border-green-200">
          <h3 className="font-semibold text-gray-800 mb-4">Add New Bill</h3>

          {/* Total Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Bill Amount (₹)
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter total amount"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner at ABC Restaurant (Optional)"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Split Section */}
          {parseFloat(totalAmount || '0') > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">Split Amounts</h4>
                <div className="text-sm text-gray-600">
                  Remaining: ₹{remainingAmount.toFixed(2)}
                </div>
              </div>

              {/* Add Split */}
              <div className="space-y-3 mb-4">
                {/* Split Type Selection */}
                <div className="flex gap-4 mb-3">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-green-600"
                      name="splitType"
                      value="equal"
                      checked={splitType === 'equal'}
                      onChange={() => setSplitType('equal')}
                    />
                    <span className="ml-2 text-gray-700">Equal Split</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-green-600"
                      name="splitType"
                      value="shares"
                      checked={splitType === 'shares'}
                      onChange={() => setSplitType('shares')}
                    />
                    <span className="ml-2 text-gray-700">Split by Shares</span>
                  </label>
                </div>

                <input
                  type="number"
                  value={currentSplitAmount}
                  onChange={(e) => setCurrentSplitAmount(e.target.value)}
                  placeholder="Enter amount to split"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <input
                  type="text"
                  value={currentSplitDescription}
                  onChange={(e) => setCurrentSplitDescription(e.target.value)}
                  placeholder="e.g., John's share for drinks (Optional)"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                {splitType === 'equal' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Select participants:</span>
                      <button
                        onClick={selectAllParticipants}
                        className="text-xs text-green-600 hover:text-green-700"
                      >
                        Select All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {participants.map(participant => (
                        <button
                          key={participant.id}
                          onClick={() => toggleParticipant(participant.id)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedParticipants.includes(participant.id)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                          {participant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {splitType === 'shares' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Assign shares:</span>
                      <button
                        onClick={selectAllParticipants}
                        className="text-xs text-green-600 hover:text-green-700"
                      >
                        Select All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {participants.map(participant => (
                        <div key={participant.id} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleParticipant(participant.id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedParticipants.includes(participant.id)
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                          >
                            {participant.name}
                          </button>
                          {selectedParticipants.includes(participant.id) && (
                            <input
                              type="number"
                              value={currentSplitShares[participant.id] || ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setCurrentSplitShares(prev => ({
                                  ...prev,
                                  [participant.id]: isNaN(value) ? 0 : value,
                                }));
                              }}
                              placeholder="Shares"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddSplit}
                  disabled={
                    !currentSplitAmount ||
                    parseFloat(currentSplitAmount) <= 0 ||
                    parseFloat(currentSplitAmount) > remainingAmount ||
                    (splitType === 'equal' && selectedParticipants.length === 0) ||
                    (splitType === 'shares' && (selectedParticipants.length === 0 || Object.values(currentSplitShares).every(share => share === 0)))
                  }
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Split
                </button>
              </div>

              {/* Current Splits */}
              {splits.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h5 className="font-medium text-gray-800">Current Splits:</h5>
                  {splits.map((split, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <span className="font-medium">₹{split.amount.toFixed(2)}</span>
                        {split.description && (
                          <span className=" text-gray-500"> ({split.description})</span>
                        )}
                        <div className="text-sm text-gray-600">
                          Split among: {split.shares ?
                            Object.keys(split.shares).map(id => {
                              const participant = participants.find(p => p.id === Number(id));
                              return `${participant?.name} (${split.shares![Number(id)]} shares)`;
                            }).join(', ')
                            :
                            split.participantIds.map(id =>
                              participants.find(p => p.id === id)?.name
                            ).join(', ')
                          }
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSplit(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {remainingAmount > 0 && (
            <p className="text-sm text-gray-500 mb-2 text-center">(Remaining amount will be split equally among all participants)</p>)}
          <div className="flex gap-2">
            <button
              onClick={handleSubmitBill}
              disabled={!totalAmount || parseFloat(totalAmount) <= 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingBillId ? 'Save Changes' : 'Add Bill'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setTotalAmount('');
                setSplits([]);
                setCurrentSplitAmount('');
                setSelectedParticipants([]);
                setDescription('');
                setCurrentSplitDescription('');
                setEditingBillId(null);
                setSplitType('equal'); // Reset split type
                setCurrentSplitShares({}); // Reset shares
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bills List */}
      <div className="space-y-4">
        {bills.map((bill, index) => (
          <div key={bill.id} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">₹{bill.total.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </div>
                  {bill.description && (
                    <div className="text-xs text-gray-500 italic">
                      {bill.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditBill(bill.id)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveBill(bill.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {bill.splits.length > 0 && (
              <div className="text-sm text-gray-600 mb-2">
                <div className="font-medium">Splits:</div>
                {bill.splits.map((split, splitIndex) => (
                    <div key={splitIndex} className="ml-2">
                    ₹{split.amount.toFixed(2)} → {split.shares ?
                      Object.keys(split.shares).map(id => {
                        const participant = participants.find(p => p.id === Number(id));
                        return `${participant?.name} (${split.shares![Number(id)]} shares)`;
                      }).join(', ')
                      :
                      split.participantIds.map(id =>
                        participants.find(p => p.id === id)?.name
                      ).join(', ')
                    }
                    {split.description && (
                      <span className="italic text-gray-500"> ({split.description})</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {bill.remainingAmount > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Remaining amount:</span> ₹{bill.remainingAmount.toFixed(2)} (split equally)
              </div>
            )}
          </div>
        ))}

        {bills.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No bills yet</p>
            <p className="text-sm">Click "Add Bill" to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillManager;