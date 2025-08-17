import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Calculator, RefreshCw } from 'lucide-react';
import ParticipantManager from './components/ParticipantManager';
import BillManager from './components/BillManager';
import SummaryDisplay from './components/SummaryDisplay';
import ConfirmModal from './components/ConfirmModal';
import { Participant, Bill, BillSplit } from './types';
import { calculateAmounts } from './utils/billCalculator';
import { Analytics } from '@vercel/analytics/react';


function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedParticipants = localStorage.getItem('billSplitter_participants');
    const savedBills = localStorage.getItem('billSplitter_bills');
    
    if (savedParticipants) {
      const parsedParticipants = JSON.parse(savedParticipants);
      setParticipants(parsedParticipants);
      
      // Initialize amounts
      const initialAmounts: { [key: number]: number } = {};
      parsedParticipants.forEach((p: Participant) => {
        initialAmounts[p.id] = 0;
      });
      setAmounts(initialAmounts);
    }
    
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('billSplitter_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('billSplitter_bills', JSON.stringify(bills));
  }, [bills]);

  // Recalculate amounts when bills or participants change
  useEffect(() => {
    if (participants.length > 0) {
      const newAmounts = calculateAmounts(participants, bills);
      setAmounts(newAmounts);
    }
  }, [participants, bills]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const clearAllData = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmClear = () => {
    setParticipants([]);
    setBills([]);
    setAmounts({});
    localStorage.removeItem('billSplitter_participants');
    localStorage.removeItem('billSplitter_bills');
    setShowConfirmModal(false);
  };

  const handleCancelClear = () => {
    setShowConfirmModal(false);
  };

  const addParticipant = (name: string) => {
    const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 0;
    const newParticipant: Participant = { id: newId, name: name.trim() };
    setParticipants([...participants, newParticipant]);
    setAmounts({ ...amounts, [newId]: 0 });
  };

  const removeParticipant = (id: number) => {
    setParticipants(participants.filter(p => p.id !== id));
    const newAmounts = { ...amounts };
    delete newAmounts[id];
    setAmounts(newAmounts);
    
    // Remove the participant from existing bills
    setBills(bills.map(bill => ({
      ...bill,
      splits: bill.splits.filter(split => !split.participantIds.includes(id))
    })));
  };

  const saveBill = (billToSave: Bill) => {
    setBills(prevBills => {
      const existingBillIndex = prevBills.findIndex(bill => bill.id === billToSave.id);
      if (existingBillIndex > -1) {
        // Update existing bill
        const updatedBills = [...prevBills];
        updatedBills[existingBillIndex] = billToSave;
        return updatedBills;
      } else {
        // Add new bill
        return [...prevBills, billToSave];
      }
    });
  };

  const removeBill = (billId: string) => {
    setBills(bills.filter(b => b.id !== billId));
  };

  const totalAmount = Object.values(amounts).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 backdrop-blur-sm px-8 py-4 rounded-full  mb-4">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Better Splitter
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Split bills easily among friends and family. Add participants, enter bills, and let us calculate who owes what.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch flex-grow">
          {/* Left Column - Participants */}
          <div className="space-y-8 flex flex-col h-full flex-grow lg:col-span-2">
            <ParticipantManager
              participants={participants}
              onAddParticipant={addParticipant}
              onRemoveParticipant={removeParticipant}
            />

            {/* Quick Stats */}
            {/* {participants.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Quick Stats</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participants:</span>
                    <span className="font-medium">{participants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bills:</span>
                    <span className="font-medium">{bills.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-green-600">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )} */}
          </div>

          {/* Middle Column - Bills */}
          <div className="flex flex-col h-full flex-grow">
            <BillManager
              participants={participants}
              bills={bills}
              onSaveBill={saveBill}
              onRemoveBill={removeBill}
            />
          </div>

          {/* Right Column - Summary */}
          <div className="flex flex-col h-full flex-grow">
            <SummaryDisplay
              participants={participants}
              amounts={amounts}
              bills={bills}
            />
          </div>
        </div>

        {/* Clear Data Button */}
        {(participants.length > 0 || bills.length > 0) && (
          <div className="text-center mt-12">
            <button
              onClick={clearAllData}
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RefreshCw className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-20 pb-8">
          <div className="backdrop-blur-sm rounded-2xl p-6 s border border-white/20 max-w-md mx-auto">
            {/* <p className="text-gray-600 mb-2">
              Made with ❤️ in India
            </p> */}
            <a
              href="https://github.com/mcabhi/better-splitter-v2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Contribute
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <Analytics />
      <ConfirmModal
        isOpen={showConfirmModal}
        message="Are you sure you want to clear all data? This action cannot be undone."
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />
    </div>
  );
}

export default App;