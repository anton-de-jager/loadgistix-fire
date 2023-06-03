import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { licenceType } from '../models/licenceType.model';
import { switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { base64ToFile } from 'ngx-image-cropper';

@Injectable({
    providedIn: 'root'
})
export class LicenceTypeService {
    licenceTypesRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth,
        private fireStorage: AngularFireStorage
    ) {
    }

    async createLicenceType(data: licenceType, avatar: string) {
        const user = await this.fireAuth.currentUser;
        //data.userId = user!.uid;
        this.firestore.collection('licenceTypes').add({
            ...data,
            //uid: user!.uid
        }).then(async (newDocRef) => {
            data.id = newDocRef.id;
            return this.firestore
                .collection('licenceTypes')
                .doc(data.id)
                .update(data);
        });
    }
    getLicenceTypes() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<licenceType>('licenceTypes', ref =>
                            ref.orderBy('description')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    updateLicenceTypes(item: licenceType, avatar: string) {
        return this.firestore
            .collection('licenceTypes')
            .doc(item.id)
            .update(item);
    }
    deleteLicenceType(id: string) {
        return this.firestore
            .collection('licenceTypes')
            .doc(id)
            .delete();
    }

    async uploadImage(collection: string, uid: string, file: any): Promise<string> {
        /**
         * You can add random number in file.name to avoid overwrites,
         * or replace the file.name to a static string if you intend to overwrite
         */
        const fileRef = this.fireStorage.ref(collection).child(uid);

        // Upload file in reference
        if (!!file) {
            const imageFile = base64ToFile(file);
            const result = await fileRef.putString(file.replace('data:image/jpeg;base64,', ''), 'base64', { contentType: 'image/png' });

            return await result.ref.getDownloadURL();
        } else {
            return '';
        }
    }



    // getAll(collection: string): AngularFirestoreCollection<any> {
    //     this.licenceTypesRef = this.firestore.collection(collection);
    //     return this.licenceTypesRef;
    // }

    // create(collection: string, licenceType: any): any {
    //     this.licenceTypesRef = this.firestore.collection(collection);
    //     return this.licenceTypesRef.add({ ...licenceType });
    // }

    // update(collection: string, id: string, data: any): Promise<void> {
    //     this.licenceTypesRef = this.firestore.collection(collection);
    //     return this.licenceTypesRef.doc(id).update(data);
    // }

    // delete(collection: string, id: string): Promise<void> {
    //     this.licenceTypesRef = this.firestore.collection(collection);
    //     return this.licenceTypesRef.doc(id).delete();
    // }
}