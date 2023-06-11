import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { directoryCategory } from '../../models/directoryCategory.model';
import { Observable, filter, from, switchMap } from 'rxjs';
import { VariableService } from 'src/app/services/variable.service';
import { LatLng } from 'leaflet';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as geofirestore from 'geofirestore';
import { environment } from 'src/environments/environment.dev';
import * as geofire from 'geofire-common';
import { directory } from 'src/app/models/directory.model';

// Initialize the Firebase SDK
firebase.initializeApp(environment.firebase);
// Create a Firestore reference
const firestore = firebase.firestore();
// Create a GeoFirestore reference
const GeoFirestore = geofirestore.initializeApp(firestore);
// Create a GeoCollection reference
const geocollection = GeoFirestore.collection('directoryCategories');

@Injectable({
    providedIn: 'root'
})
export class DirectoryCategoryService {
    directoryCategoriesRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth,
        private variableService: VariableService
    ) {
    }

    async createDirectoryCategory(data: directoryCategory) {
        const user = await this.fireAuth.currentUser;
        this.firestore.collection('directoryCategories').add({
            ...data,
            uid: user!.uid
        }).then(async (newDocRef) => {
            data.id = newDocRef.id;
            return this.firestore
                .collection('directoryCategories')
                .doc(data.id)
                .update(data)
        });
    }
    getDirectoryCategories() {
        return this.firestore
            .collection<directoryCategory>('directoryCategories', ref =>
                ref.orderBy('description')
            )
            .valueChanges({ idField: 'id' });
    }

    async getDirectoryCategoriesWithDirectoryCount() {
        const directories: directory[] = (await(firestore.collection("directories").get())).docs.map((doc) => doc.data());
        const directoryCategories: directoryCategory[] = (await(firestore.collection("directoryCategories").get())).docs.map((doc) => doc.data());

        directoryCategories.forEach((directoryCategory) => {
            directoryCategory.directoryCount = directories.filter(x => x.directoryCategoryId == directoryCategory.id).length;
        });

        return directoryCategories.map(directoryCategory => directoryCategory);
    }

    updateDirectoryCategories(data: directoryCategory) {
        return this.firestore
            .collection('directoryCategories')
            .doc(data.id)
            .update(data);
    }
    deleteDirectoryCategory(id: string) {
        return this.firestore
            .collection('directoryCategories')
            .doc(id)
            .delete();
    }
}