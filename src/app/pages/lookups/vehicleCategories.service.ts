import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { vehicleCategory } from '../../models/vehicleCategory.model';
import { switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VehicleCategoryService {
    vehicleCategoriesRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth
    ) {
    }

    async createVehicleCategory(data: vehicleCategory) {
        const user = await this.fireAuth.currentUser;
        // data.userId = user!.uid;
        this.firestore.collection('vehicleCategories').add({
            ...data,
            uid: user!.uid
        }).then((newDocRef) => {
            data.id = newDocRef.id;
            return this.firestore
                .collection('vehicleCategories')
                .doc(data.id)
                .update(data)
        });
    }
    getVehicleCategories() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<vehicleCategory>('vehicleCategories', ref =>
                            ref.orderBy('description')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    updateVehicleCategories(item: vehicleCategory) {
        return this.firestore
            .collection('vehicleCategories')
            .doc(item.id)
            .update(item);
    }
    deleteVehicleCategory(id: string) {
        return this.firestore
            .collection('vehicleCategories')
            .doc(id)
            .delete();
    }
}