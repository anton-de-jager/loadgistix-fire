import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { loadCategory } from '../../models/loadCategory.model';
import { switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadCategoryService {
    loadCategoriesRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth
    ) {
    }

    async createLoadCategory(data: loadCategory) {
        const user = await this.fireAuth.currentUser;
        // data.userId = user!.uid;
        this.firestore.collection('loadCategories').add({
            ...data,
            uid: user!.uid
        }).then((newDocRef) => {
            data.id = newDocRef.id;
            return this.firestore
                .collection('loadCategories')
                .doc(data.id)
                .update(data)
        });
    }
    getLoadCategories() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<loadCategory>('loadCategories', ref =>
                            ref.orderBy('description')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    updateLoadCategories(item: loadCategory) {
        return this.firestore
            .collection('loadCategories')
            .doc(item.id)
            .update(item);
    }
    deleteLoadCategory(id: string) {
        return this.firestore
            .collection('loadCategories')
            .doc(id)
            .delete();
    }
}