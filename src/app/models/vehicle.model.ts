import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as turf from '@turf/turf';

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
    originatingCoordinates?: turf.Point;
    originatingAddress?: string;
    destinationCoordinates?: turf.Point;
    destinationAddress?: string;
    avatar?: string;
    status?: string;
}