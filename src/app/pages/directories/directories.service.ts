import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { directory } from '../../models/directory.model';
import { switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { base64ToFile } from 'ngx-image-cropper';

@Injectable({
    providedIn: 'root'
})
export class DirectoryService {
    directoriesRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth,
        private fireStorage: AngularFireStorage
    ) {
    }

    async createDirectory(data: directory, avatar: string) {
        //console.log(directory);
        const user = await this.fireAuth.currentUser;
        data.userId = user!.uid;
        this.firestore.collection('directories').add({
            ...data,
            uid: user!.uid
        }).then(async (newDocRef) => {
            data.id = newDocRef.id;
            if (avatar) {
                data.avatar = await this.uploadImage('directories', newDocRef.id, avatar);
                return this.firestore
                    .collection('directories')
                    .doc(data.id)
                    .update(data);
            } else {
                return this.firestore
                    .collection('directories')
                    .doc(data.id)
                    .update(data);
            }
        });
    }
    getDirectories() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<directory>('directories', ref =>
                            ref
                                .where('uid', '==', user.uid)
                                .orderBy('description')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    getDirectoriesOpen() {
        return this.firestore
            .collection<directory>('directories', ref =>
                ref
                    .orderBy('title')
            )
            .valueChanges({ idField: 'id' });;
    }
    updateDirectories(item: directory, avatar: string) {
        return this.firestore
            .collection('directories')
            .doc(item.id)
            .update(item).then(async () => {
                if (avatar) {
                    item.avatar = await this.uploadImage('directories', item.id!, avatar);
                    return this.firestore
                        .collection('directories')
                        .doc(item.id)
                        .update(item);
                } else {
                    return this.firestore
                        .collection('directories')
                        .doc(item.id)
                        .update(item);
                }
            });
    }
    deleteDirectory(id: string) {
        return this.firestore
            .collection('directories')
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