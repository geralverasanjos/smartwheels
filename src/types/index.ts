export interface Promotion {
    id: string; // Firestore IDs are strings
    title: string;
    description: string;
    type: 'percentage' | 'fixed_discount' | 'fixed_price';
    value: number;
    startDate: string;
    endDate: string;
    status: 'Ativa' | 'Inativa';
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    nif: string;
    address: string;
    avatarUrl?: string;
}
