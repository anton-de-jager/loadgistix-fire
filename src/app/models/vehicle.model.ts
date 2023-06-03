import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export class vehicle {
    id?: string;
    userId?: string;
    userDescription?: string;
    vehicleCategoryId?: string;
    vehicleCategoryDescription?: string;
    vehicleTypeId?: string;
    vehicleTypeDescription?: string;
    description?: string;
    registrationNumber?: string;
    maxLoadWeight?: number;
    maxLoadHeight?: number;
    maxLoadWidth?: number;
    maxLoadLength?: number;
    maxLoadVolume?: number;
    availableCapacity?: number;
    availableFrom?: Date;
    availableTo?: Date;
    originatingAddress?: string;
    originatingAddressLabel?: string;
    originatingAddressLat?: number;
    originatingAddressLon?: number;
    destinationAddress?: string;
    destinationAddressLabel?: string;
    destinationAddressLat?: number;
    destinationAddressLon?: number;
    avatar?: string;
    status?: string;
}