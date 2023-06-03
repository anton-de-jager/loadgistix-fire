import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as geofirestore from 'geofirestore';
import { bid } from "./bid.model";
import * as geofire from 'geofire-common';

export class load {
    id?: string;
    userId?: string;
    userDescription?: string;
    loadCategoryId?: string;
    loadCategoryDescription?: string;
    loadTypeId?: string;
    loadTypeDescription?: string;
    loadTypeLiquid?: boolean;
    description?: string;
    note?: string;
    price?: number;
    originatingAddress?: string;
    originatingAddressLabel?: string;
    originatingAddressLat?: number;
    originatingAddressLon?: number;
    destinationAddress?: string;
    destinationAddressLabel?: string;
    destinationAddressLat?: number;
    destinationAddressLon?: number;
    itemCount?: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    volumeCm?: number;
    volumeLt?: number;
    totalValue?: number;
    dateOut?: Date;
    dateIn?: Date;
    dateBidEnd?: Date;
    avatar?: string;
    status?: string;
    review?: number;
    reviewCount?: number;
    bidCount?: number;
    userIdAccepted?: string;
    userIdLoaded?: string;
    userIdLoadedConfirmed?: string;
    userIdDelivered?: string;
    userIdDeliveredConfirmed?: string;
    bid?: bid[];
}