import { Donation } from '@/types';

// Mock data (Model Simulation)
const MOCK_DONATIONS: Donation[] = [
  {
    id: '1',
    title: 'Bantuan Banjir Demak',
    description: 'Bantuan darurat untuk korban banjir di Demak.',
    targetAmount: 100000000,
    currentAmount: 45000000,
    category: 'bencana',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Beasiswa Anak Yatim',
    description: 'Beasiswa pendidikan untuk anak yatim berprestasi.',
    targetAmount: 50000000,
    currentAmount: 12500000,
    category: 'pendidikan',
    createdAt: new Date(),
  },
];

export const donationService = {
  getAll: async (): Promise<Donation[]> => {
    // Simulate DB delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_DONATIONS;
  },

  getById: async (id: string): Promise<Donation | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_DONATIONS.find((d) => d.id === id) || null;
  },

  create: async (data: Omit<Donation, 'id' | 'createdAt' | 'currentAmount'>): Promise<Donation> => {
    const newDonation: Donation = {
      ...data,
      id: Math.random().toString(36).substring(7),
      currentAmount: 0,
      createdAt: new Date(),
    };
    MOCK_DONATIONS.push(newDonation);
    return newDonation;
  },
};
