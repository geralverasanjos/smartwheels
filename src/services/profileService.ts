// src/services/profileService.ts
import type { UserProfile } from '@/types';

const mockDriverProfile: UserProfile = {
  name: 'Carlos Silva',
  email: 'carlos.silva@example.com',
  phone: '+351 912 345 678',
  nif: '234567890',
  address: 'Rua das Flores, 123, 1200-123 Lisboa',
  avatarUrl: 'https://placehold.co/100x100.png',
};

const mockPassengerProfile: UserProfile = {
    name: 'Ana Sousa',
    email: 'ana.sousa@example.com',
    phone: '+351 987 654 321',
    nif: '123456789',
    address: 'Avenida da Liberdade, 456, 1250-142 Lisboa',
    avatarUrl: 'https://placehold.co/100x100/32CD32/FFFFFF.png?text=AS',
};

const mockFleetManagerProfile: UserProfile = {
    name: 'Gestor de Frota',
    email: 'gestor@smartwheels.com',
    phone: '+351 911 222 333',
    nif: '987654321',
    address: 'Parque das Nações, 1990-096 Lisboa',
    avatarUrl: 'https://placehold.co/100x100.png',
};

export const getDriverProfile = (): Promise<UserProfile> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockDriverProfile);
    }, 500); 
  });
};

export const getPassengerProfile = (): Promise<UserProfile> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockPassengerProfile);
    }, 500); 
  });
};

export const getFleetManagerProfile = (): Promise<UserProfile> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockFleetManagerProfile);
      }, 500);
    });
  };
