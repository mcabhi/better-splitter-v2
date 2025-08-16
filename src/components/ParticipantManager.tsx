import React, { useState } from 'react';
import { Plus, UserX, Users } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantManagerProps {
  participants: Participant[];
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (id: number) => void;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  onAddParticipant,
  onRemoveParticipant
}) => {
  const [newParticipantName, setNewParticipantName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipantName.trim()) {
      onAddParticipant(newParticipantName);
      setNewParticipantName('');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Participants</h2>
      </div>

      {/* Add Participant Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            placeholder="Enter participant name"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Participants List */}
      <div className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100 hover:bg-gray-100/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {participant.id}
              </div>
              <span className="font-medium text-gray-800">{participant.name}</span>
            </div>
            <button
              onClick={() => onRemoveParticipant(participant.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove participant"
            >
              <UserX className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {participants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No participants yet</p>
            <p className="text-sm">Add someone to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantManager;