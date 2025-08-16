export interface Participant {
  id: number;
  name: string;
}

export interface BillSplit {
  amount: number;
  participantIds: number[];
}

export interface Bill {
  id: string;
  total: number;
  splits: BillSplit[];
  remainingAmount: number;
  createdAt: Date;
}