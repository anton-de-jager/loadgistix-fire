import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { load } from '../../models/load.model';
import { Observable, filter, from, switchMap } from 'rxjs';
import { VariableService } from 'src/app/services/variable.service';
import { LatLng } from 'leaflet';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
//import * as geofirestore from 'geofirestore';
import * as geofire from 'geofire-common';
import { environment } from 'src/environments/environment.dev';
import { bid } from 'src/app/models/bid.model';
import { UserService } from 'src/app/services/user.service';

import 'firebase/compat/firestore';
import { map } from 'rxjs/operators';
import { Point, distance } from '@turf/turf';
// import { debug } from 'console';

// // Initialize the Firebase SDK
// firebase.initializeApp(environment.firebase);
// // Create a Firestore reference
// const firestore = firebase.firestore();
// // Create a GeoFirestore reference
// const GeoFirestore = geofirestore.initializeApp(firestore);
// // Create a GeoCollection reference
// const geocollection = GeoFirestore.collection('loads');

@Injectable({
    providedIn: 'root'
})
export class LoadService {
    loadsRef!: AngularFirestoreCollection<any>;
    firestoreLoadCollection = this.firestore.collection<load>('loads');

    constructor(
        private firestore: AngularFirestore,
        private fireAuth: AngularFireAuth,
        private userService: UserService
    ) {
    }

    async createLoad(data: load) {
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

    loads$ = this.userService.user$.pipe(
        switchMap(user =>
            this.firestore.collection<load>('loads', ref => ref.where('userId', '==', user!.uid)).snapshotChanges()
        ),
        map(actions => {
            return actions.map(p => {
                const load = p.payload.doc;
                const id = load.id;
                return { id, ...load.data() } as load;
            });
        })
    );

    getItemsWithinRadius(center: Point, radius: number): Observable<load[]> {
        const collectionRef = firebase.firestore().collection('loads');
        
        return new Observable<load[]>((observer) => {
          const unsubscribe = collectionRef.onSnapshot((snapshot) => {
            const filteredItems: load[] = [];
            
            snapshot.forEach((doc) => {
              const item = doc.data() as load;
              item.id = doc.id;
            //   debug
              const originatingPoint = item.originatingCoordinates!.coordinates;
              const originatingDistance = distance(center, originatingPoint, { units: 'kilometers' });
      
              const destinationPoint = item.destinationCoordinates!.coordinates;
              const destinationDistance = distance(center, destinationPoint, { units: 'kilometers' });
      
              if (originatingDistance <= radius || destinationDistance <= radius) {
                filteredItems.push(item);
              }
            });
            
            observer.next(filteredItems);
          });
          
          return unsubscribe;
        });
      }

    // getLoadsFilter(position: LatLng, range: number | undefined, maxWeight: number | undefined, maxVolumeCm: number | undefined, maxVolumeLt: number | undefined, role: string) {
    //     return this.fireAuth.authState.pipe(
    //         switchMap(async user => {
    //             if (user) {
    //                 const center: geofire.Geopoint = [position.lat, position.lng];
    //                 console.log('center', center);
    //                 const radiusInM = range! ?? 10000;

    //                 const bounds = geofire.geohashQueryBounds(center, radiusInM);
    //                 console.log('bounds', bounds);
    //                 const promises = [];
    //                 for (const b of bounds) {
    //                     const q = firestore.collection('loads')
    //                         .orderBy('originatingAddress')
    //                         .orderBy('destinationAddress')
    //                         .startAt(b[0])
    //                         .endAt(b[1]);
    //                     promises.push(q.get());
    //                 }
    //                 console.log('promises', promises);

    //                 // Collect all the query results together into a single list
    //                 return Promise.all(promises).then((snapshots) => {
    //                     const matchingDocs = [];

    //                     console.log('snapshots', snapshots);

    //                     for (const snap of snapshots) {
    //                         for (const doc of snap.docs) {
    //                             console.log('doc', doc);
    //                             const latOriginating = doc.get('originatingCoordinates');
    //                             const latDestination = doc.get('destinationCoordinates');

    //                             // We have to filter out a few false positives due to GeoHash
    //                             // accuracy, but most will match
    //                             const distanceInKmOriginating = geofire.distanceBetween([latOriginating, lngOriginating], center);
    //                             const distanceInKmDestination = geofire.distanceBetween([latDestination, lngDestination], center);
    //                             const distanceInM = (distanceInKmOriginating < distanceInKmDestination ? distanceInKmOriginating : distanceInKmDestination);
    //                             console.log('distanceInM', distanceInM);
    //                             console.log('radiusInM', radiusInM);
    //                             if (distanceInM <= radiusInM) {
    //                                 if (
    //                                     (
    //                                         (
    //                                             role == 'vehicle' &&
    //                                             doc.get('status') in ['Open', 'Bids']
    //                                         )
    //                                         ||
    //                                         (
    //                                             role == 'load' &&
    //                                             doc.get('userId') == user.uid &&
    //                                             doc.get('status') in ['Open', 'Bids', 'En-Route', 'Accepted']
    //                                         )
    //                                         ||
    //                                         role == 'admin'
    //                                     )
    //                                     &&
    //                                     (
    //                                         maxWeight == null || maxWeight == undefined
    //                                         ||
    //                                         (
    //                                             maxWeight !== null && maxWeight !== undefined
    //                                             && Number(doc.get('weight')) <= maxWeight
    //                                         )
    //                                     )
    //                                     &&
    //                                     (
    //                                         maxVolumeCm == null || maxVolumeCm == undefined
    //                                         ||
    //                                         (
    //                                             maxVolumeCm !== null && maxVolumeCm !== undefined
    //                                             && Number(doc.get('volumeCm')) <= maxVolumeCm
    //                                         )
    //                                     )
    //                                     &&
    //                                     (
    //                                         maxVolumeLt == null || maxVolumeLt == undefined
    //                                         ||
    //                                         (
    //                                             maxVolumeLt !== null && maxVolumeLt !== undefined
    //                                             && Number(doc.get('volumeLt')) <= maxVolumeLt
    //                                         )
    //                                     )
    //                                 ) {
    //                                     matchingDocs.push(doc);
    //                                 }
    //                             }
    //                         }
    //                     }

    //                     return matchingDocs.map(doc => doc.data());
    //                 });
    //             } else {
    //                 return [];
    //             }
    //         })
    //     );
    // }

    // getLoadsFilter(position: LatLng, range: number | undefined, maxWeight: number | undefined, maxVolumeCm: number | undefined, maxVolumeLt: number | undefined, role: string) {
    //     return this.fireAuth.authState.pipe(
    //         switchMap(user => {
    //             if (user) {
    //                 // Create a geoquery based around a certain location and radius
    //                 let query = geocollection.near({ center: new firebase.firestore.GeoPoint(position.lat, position.lng), radius: (range! ?? 10000) * 1000 });

    //                 // Add a Firestore where clause
    //                 if (role == 'vehicle') {
    //                     query = query.where('status', 'in', ['Open', 'Bids']);
    //                 }
    //                 if (role == 'load') {
    //                     query = query.where('userId', '==', user.uid);
    //                     query = query.where('status', 'in', ['Open', 'Bids', 'En-Route', 'Accepted']);
    //                 }
    //                 if (maxWeight !== null && maxWeight !== undefined) {
    //                     query = query.where('weight', '<=', maxWeight);
    //                 }
    //                 if (maxVolumeCm !== null && maxVolumeCm !== undefined) {
    //                     query = query.where('volumeCm', '<=', maxVolumeCm);
    //                 }
    //                 if (maxVolumeLt !== null && maxVolumeLt !== undefined) {
    //                     query = query.where('volumeLt', '<=', maxVolumeLt);
    //                 }

    //                 // Get the query results
    //                 return query.get().then((value) => {
    //                     console.log(value.docs); // All docs returned by GeoQuery, sorted by distance from the query center
    //                     return value.docs.map(doc => doc.data());
    //                 });
    //             } else {
    //                 return [];
    //             }
    //         })
    //     );
    // }

    getLoadsWithBidCount() {
        return this.fireAuth.authState.pipe(
            switchMap(async user => {
                // if (user) {
                //     const bids: bid[] = (await (firestore.collection("bids").where("status", "==", "Open").where("loadUserId", "==", user.uid).get())).docs.map((doc) => doc.data());
                //     const loads: load[] = (await (firestore.collection("loads").where("userId", "==", user.uid).get())).docs.map((doc) => doc.data());

                //     loads.forEach((load) => {
                //         load.bidCount = bids.filter(x => x.loadId == load.id).length;
                //     });

                //     return loads.map(load => load);
                // } else {
                //     return [];
                // }
            })
        )
    }

    updateLoads(data: load, routeChanged: boolean) {
        data.volumeCm = (data.loadTypeLiquid ? null : data.width! * data.height! * data.length!) ?? undefined;
        if (routeChanged) {
            data.route = undefined;
        }
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