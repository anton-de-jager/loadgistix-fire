import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { load } from '../../models/load.model';
import { Observable, filter, from, switchMap } from 'rxjs';
import { VariableService } from 'src/app/services/variable.service';
import { LatLng } from 'leaflet';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as geofirestore from 'geofirestore';
import { environment } from 'src/environments/environment';
import * as geofire from 'geofire-common';
import { bid } from 'src/app/models/bid.model';

// Initialize the Firebase SDK
firebase.initializeApp(environment.firebase);
// Create a Firestore reference
const firestore = firebase.firestore();
// Create a GeoFirestore reference
const GeoFirestore = geofirestore.initializeApp(firestore);
// Create a GeoCollection reference
const geocollection = GeoFirestore.collection('loads');

@Injectable({
    providedIn: 'root'
})
export class LoadService {
    loadsRef!: AngularFirestoreCollection<any>;

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth,
        private variableService: VariableService
    ) {
    }

    async createLoad(data: load) {
        data.originatingAddress = geofire.geohashForLocation([data.originatingAddressLat!, data.originatingAddressLon!])! ?? null;
        data.destinationAddress = geofire.geohashForLocation([data.destinationAddressLat!, data.destinationAddressLon!])! ?? null;
        data.volumeCm = (data.loadTypeLiquid ? null : data.width! * data.height! * data.length!) ?? undefined;
        const user = await this.fireAuth.currentUser;
        data.userId = user!.uid;
        this.firestore.collection('loads').add({
            ...data,
            uid: user!.uid
        }).then(async (newDocRef) => {
            data.id = newDocRef.id;
            return this.firestore
                .collection('loads')
                .doc(data.id)
                .update(data)
        });
    }
    getLoads() {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.firestore
                        .collection<load>('loads', ref =>
                            ref.where('uid', '==', user.uid)
                                .orderBy('description')
                        )
                        .valueChanges({ idField: 'id' });
                } else {
                    return [];
                }
            }),
        );
    }
    getLoadsFilter(position: LatLng, range: number, maxWeight: number, maxVolumeCm: number, maxVolumeLt: number) {
        return this.fireAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    const center: geofire.Geopoint = [position.lat, position.lng];
                    const radiusInM = range * 1000;

                    const bounds = geofire.geohashQueryBounds(center, radiusInM);
                    const promises = [];
                    for (const b of bounds) {
                        const q = firestore.collection('loads')
                            .orderBy('destinationAddress')
                            .startAt(b[0])
                            .endAt(b[1]);

                        promises.push(q.get());
                    }

                    // Collect all the query results together into a single list
                    return Promise.all(promises).then((snapshots) => {
                        const matchingDocs = [];

                        for (const snap of snapshots) {
                            for (const doc of snap.docs) {
                                const lat = doc.get('destinationAddressLat');
                                const lng = doc.get('destinationAddressLon');

                                // We have to filter out a few false positives due to GeoHash
                                // accuracy, but most will match
                                const distanceInKm = geofire.distanceBetween([lat, lng], center);
                                const distanceInM = distanceInKm * 1000;
                                if (distanceInM <= radiusInM) {
                                    matchingDocs.push(doc);
                                }
                            }
                        }

                        return matchingDocs.map(doc => doc.data());
                    });
                } else {
                    return [];
                }
            })
        );
    }

    getLoadsWithBidCount() {
        return this.fireAuth.authState.pipe(
            switchMap(async user => {
                if (user) {
                    const bids: bid[] = (await (firestore.collection("bids").where("status", "==", "Open").where("loadUserId", "==", user.uid).get())).docs.map((doc) => doc.data());
                    const loads: load[] = (await (firestore.collection("loads").where("userId", "==", user.uid).get())).docs.map((doc) => doc.data());

                    loads.forEach((load) => {
                        load.bidCount = bids.filter(x => x.loadId == load.id).length;
                    });

                    return loads.map(load => load);
                } else {
                    return [];
                }
            })
        )
    }

    updateLoads(data: load) {
        data.originatingAddress = geofire.geohashForLocation([data.originatingAddressLat!, data.originatingAddressLon!])! ?? null;
        data.destinationAddress = geofire.geohashForLocation([data.destinationAddressLat!, data.destinationAddressLon!])! ?? null;
        data.volumeCm = (data.loadTypeLiquid ? null : data.width! * data.height! * data.length!) ?? undefined;
        return this.firestore
            .collection('loads')
            .doc(data.id)
            .update(data);
    }
    deleteLoad(id: string) {
        return this.firestore
            .collection('loads')
            .doc(id)
            .delete();
    }
}