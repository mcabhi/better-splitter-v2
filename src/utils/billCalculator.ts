import { Participant, Bill, BillSplit } from '../types';

export const calculateAmounts = (participants: Participant[], bills: Bill[]): { [key: number]: number } => {
  const amounts: { [key: number]: number } = {};
  
  // Initialize amounts to 0
  participants.forEach(participant => {
    amounts[participant.id] = 0;
  });

  bills.forEach(bill => {
    const billAmounts: { [key: number]: number } = {};
    participants.forEach(p => billAmounts[p.id] = 0);

    // Add splittable amounts
    bill.splits.forEach(split => {
      if (split.shares && Object.keys(split.shares).length > 0) {
        const totalShares = Object.values(split.shares).reduce((sum, share) => sum + share, 0);
        if (totalShares > 0) {
          for (const participantId in split.shares) {
            const id = Number(participantId);
            const share = split.shares[id];
            if (billAmounts[id] !== undefined) {
              billAmounts[id] += (split.amount * share) / totalShares;
            }
          }
        }
      } else if (split.participantIds.length > 0) {
        const amountPerPerson = split.amount / split.participantIds.length;
        split.participantIds.forEach(id => {
          if (billAmounts[id] !== undefined) {
            billAmounts[id] += amountPerPerson;
          }
        });
      }
    });

    // Add remaining amount split equally among all participants
    if (bill.remainingAmount > 0 && participants.length > 0) {
      const remainingPerPerson = bill.remainingAmount / participants.length;
      participants.forEach(participant => {
        billAmounts[participant.id] += remainingPerPerson;
      });
    }

    // Apply discount
    if (bill.discount && bill.discount.amount > 0) {
      const discount = bill.discount;
      if (discount.splitType === 'proportional') {
        const totalBill = bill.total;
        if (totalBill > 0) {
          participants.forEach(p => {
            const proportionalDiscount = (billAmounts[p.id] / totalBill) * discount.amount;
            billAmounts[p.id] -= proportionalDiscount;
          });
        }
      } else if (discount.shares && Object.keys(discount.shares).length > 0) {
        const totalShares = Object.values(discount.shares).reduce((sum, share) => sum + share, 0);
        if (totalShares > 0) {
          for (const participantId in discount.shares) {
            const id = Number(participantId);
            const share = discount.shares[id];
            if (billAmounts[id] !== undefined) {
              billAmounts[id] -= (discount.amount * share) / totalShares;
            }
          }
        }
      }
    }

    // Add bill amounts to total amounts
    participants.forEach(p => {
      amounts[p.id] += billAmounts[p.id];
    });
  });

  return amounts;
};
