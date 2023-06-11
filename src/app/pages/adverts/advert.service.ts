import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { advert } from '../../models/advert.model';
import { switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { base64ToFile } from 'ngx-image-cropper';

@Injectable({
    providedIn: 'root'
})
export class AdvertService {
    advertsRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth,
        private fireStorage: AngularFireStorage
    ) {
    }

    async createAdvert(data: advert, avatar: string) {
        //console.log(advert);
        const user = await this.fireAuth.currentUser;
        data.userId = user!.uid;
        this.firestore.collection('adverts').add({
            ...data,
            uid: user!.uid
        }).then(async (newDocRef) => {
            data.id = newDocRef.id;
            if (avatar) {
                data.avatar = await this.uploadImage('adverts', newDocRef.id, avatar);
                return this.firestore
                    .collection('adverts')
                    .doc(data.id)
                    .update(data);
            } else {
                return this.firestore
                    .collection('adverts')
                    .doc(data.id)
                    .update(data);
            }
        });
    }
    getAdverts() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<advert>('adverts', ref =>
                            ref
                                .where('uid', '==', user.uid)
                                .orderBy('title')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    getAdvertsOpen() {
        return this.firestore
            .collection<advert>('adverts', ref =>
                ref
                    .orderBy('title')
            )
            .valueChanges({ idField: 'id' });;
    }
    updateAdverts(item: advert, avatar: string) {
        return this.firestore
            .collection('adverts')
            .doc(item.id)
            .update(item).then(async () => {
                if (avatar) {
                    item.avatar = await this.uploadImage('adverts', item.id!, avatar);
                    return this.firestore
                        .collection('adverts')
                        .doc(item.id)
                        .update(item);
                } else {
                    return this.firestore
                        .collection('adverts')
                        .doc(item.id)
                        .update(item);
                }
            });
    }
    deleteAdvert(id: string) {
        return this.firestore
            .collection('adverts')
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
}