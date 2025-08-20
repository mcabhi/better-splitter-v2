import { Participant, Bill, BillSplit } from '../types';

export const calculateAmounts = (participants: Participant[], bills: Bill[]): { [key: number]: number } => {
  const amounts: { [key: number]: number } = {};
  
  // Initialize amounts to 0
  participants.forEach(participant => {
    amounts[participant.id] = 0;
  });

  bills.forEach(bill => {
    // Add splittable amounts
    bill.splits.forEach(split => {
      if (split.shares && Object.keys(split.shares).length > 0) {
        const totalShares = Object.values(split.shares).reduce((sum, share) => sum + share, 0);
        if (totalShares > 0) {
          for (const participantId in split.shares) {
            const id = Number(participantId);
            const share = split.shares[id];
            if (amounts[id] !== undefined) {
              amounts[id] += (split.amount * share) / totalShares;
            }
          }
        }
      } else if (split.participantIds.length > 0) {
        const amountPerPerson = split.amount / split.participantIds.length;
        split.participantIds.forEach(id => {
          if (amounts[id] !== undefined) {
            amounts[id] += amountPerPerson;
          }
        });
      }
    });

    // Add remaining amount split equally among all participants
    if (bill.remainingAmount > 0 && participants.length > 0) {
      const remainingPerPerson = bill.remainingAmount / participants.length;
      participants.forEach(participant => {
        amounts[participant.id] += remainingPerPerson;
      });
    }
  });

  return amounts;
};

export const addAmountToPersons = (
  amounts: { [key: number]: number },
  participantIds: number[],
  amount: number
): { [key: number]: number } => {
  const newAmounts = { ...amounts };
  const amountPerPerson = amount / participantIds.length;
  
  participantIds.forEach(id => {
    if (newAmounts[id] !== undefined) {
      newAmounts[id] += amountPerPerson;
    }
  });
  
  return newAmounts;
};