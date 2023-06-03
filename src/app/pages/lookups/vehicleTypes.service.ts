import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { vehicleType } from '../../models/vehicleType.model';
import { switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VehicleTypeService {
    vehicleTypesRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth
    ) {
    }

    async createVehicleType(data: vehicleType) {
        const user = await this.fireAuth.currentUser;
        // data.userId = user!.uid;
        this.firestore.collection('vehicleTypes').add({
            ...data,
            uid: user!.uid
        }).then((newDocRef) => {
            data.id = newDocRef.id;
            return this.firestore
                .collection('vehicleTypes')
                .doc(data.id)
                .update(data)
        });
    }
    getVehicleTypes() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<vehicleType>('vehicleTypes', ref =>
                            ref.orderBy('description')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    updateVehicleTypes(item: vehicleType) {
        return this.firestore
            .collection('vehicleTypes')
            .doc(item.id)
            .update(item);
    }
    deleteVehicleType(id: string) {
        return this.firestore
            .collection('vehicleTypes')
            .doc(id)
            .delete();
    }
}