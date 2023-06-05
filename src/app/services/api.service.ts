// import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { KeyValue } from '@angular/common';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { base64ToFile } from 'ngx-image-cropper';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable()
export class ApiService {
  itemsRef!: AngularFirestoreCollection<any>;
  itemRef!: AngularFirestoreDocument<any>;
  items!: Observable<any[]>;

  // getHeaderPayfast(): HttpHeaders {
  //     return new HttpHeaders({
  //         'Content-Type': 'application/json',
  //         'Access-Control-Allow-Origin': '*',
  //         'Access-Control-Allow-Headers': 'Content-Type',
  //         'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT'
  //     });
  // }

  constructor(
    private firestore: AngularFirestore,
    private fireAuth: AngularFireAuth,
    private fireStorage: AngularFireStorage,
    private http: HttpClient
  ) { }

  getHeader(): HttpHeaders {
    return localStorage.getItem('accessToken') && localStorage.getItem('userId') ? new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
        //'id': localStorage.getItem('userId'),
        "Authorization": "Bearer " + localStorage.getItem('accessToken')
    }) : new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
        'Content-Type': 'application/json'
    });
}

  getUsersFilter(distance: string, lat: string, lon: string) {
    this.itemsRef = this.firestore.collection('users/' + distance + '/' + lat + '/' + lon);
    return this.itemsRef.valueChanges({ idField: 'id' });
  }

  getUsersList(distance: string, userTypeIds: string, vibe: string, quality: string, price: string, lat: string, lon: string, startIndex: string, orderBy: string) {
    let parms: KeyValue<string, string>[] = [];
    parms.push({ key: 'distance', value: distance });
    parms.push({ key: 'userTypeIds', value: userTypeIds });
    parms.push({ key: 'vibe', value: vibe });
    parms.push({ key: 'quality', value: quality });
    parms.push({ key: 'price', value: price });
    parms.push({ key: 'lat', value: lat });
    parms.push({ key: 'lon', value: lon });
    parms.push({ key: 'startIndex', value: startIndex });
    parms.push({ key: 'orderBy', value: orderBy });

    let collection = this.firestore.collection('users', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      parms.forEach(parm => {
        query = query.where(parm.key, '==', parm.value);
      });
      return query;
    });

    return collection.valueChanges({ idField: 'id' });
  }

  // getUsersCount(distance, userTypeIds, vibe, quality, price, lat, lon) {
  //     return this.http.get<any>(environment.api + 'users/count/' + distance + '/' + userTypeIds + '/' + vibe + '/' + quality + '/' + price + '/' + lat + '/' + lon, { headers: this.getHeader() });
  // }

  // getUsersListUnrated(distance, userTypeIds, lat, lon, startIndex, orderBy) {
  //     return this.http.get<any>(environment.api + 'users/list/unrated/' + distance + '/' + userTypeIds + '/' + lat + '/' + lon + '/' + startIndex + '/' + orderBy, { headers: this.getHeader() });
  // }

  // getUsersCountUnrated(distance, userTypeIds, lat, lon) {
  //     return this.http.get<any>(environment.api + 'users/count/unrated/' + distance + '/' + userTypeIds + '/' + lat + '/' + lon, { headers: this.getHeader() });
  // }

  // getReviewByUrlImage(urlImage) {
  //     return this.http.get<any>(environment.api + 'reviews/details/' + urlImage, { headers: this.getHeader() });
  // }

  // getReviewsByUserId(userId) {
  //     return this.http.get<any>(environment.api + 'reviews/user/' + userId, { headers: this.getHeader() });
  // }

  // getNavigation() {
  //     return this.http.get<Navigation>(environment.api + 'navigation', { headers: this.getHeader() });
  // }

  // upload(model, formData, filename) {
  //     return this.http.post(environment.api + model + '/uploadImage/' + filename, formData, { reportProgress: true, observe: 'events' });
  // }

  getItem(collection: string, id: string) {
    this.itemRef = this.firestore.doc(collection + '/' + id);
    return this.itemRef.valueChanges({ idField: 'id' });
  }

  getItems(model: string): Observable<any[]> {
    this.itemsRef = this.firestore.collection(model);
    return this.itemsRef.valueChanges({ idField: 'id' });
  }

  createItem(model: string, item: any): Promise<any> {
    return this.firestore.collection(model).add(item).then((docRef) => {
      docRef.get().then(async doc => {
        if (doc.exists) {
          let result: any = doc.data();
          result.id = doc.id;
          console.log('doc data', result);
          if (item.avatarChanged) {
            console.log("Saving file to:" + model + '/' + result.id, item.fileToUpload);
            const fullPathInStorage = await this.uploadImage(model, result.id, item.fileToUpload);
            console.log('fullPathInStorage', fullPathInStorage);
            item.avatar = await this.fireStorage.ref(fullPathInStorage).getDownloadURL().toPromise();
            item.fileToUpload = null;
            return docRef.update(item).then(async () => {
              return item;
            });
          } else {
            return result;
          }
        } else {
          console.log("No such document!");
          return null;
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
        return null;
      });



    });
  }

  updateItem(model: string, item: any): Promise<any> {
    const docRef = this.firestore.doc(model + '/' + item.id).ref;
    return docRef.get().then(async doc => {
      if (doc.exists) {
        if (item.avatarChanged) {
          const fullPathInStorage = await this.uploadImage(model, item.id, item.fileToUpload);
          item.avatar = await this.fireStorage.ref(fullPathInStorage).getDownloadURL().toPromise();
          item.fileToUpload = null;
          return docRef.update(item).then(async () => {
            return item;
          });
        } else {
          return docRef.update(item).then(async () => {
            return item;
          });
        }
      } else {
        return item;
      }
    });
  }

  deleteItem(model: string, id: string, filePath: string) {
    this.itemRef = this.firestore.doc(model + '/' + id);
    return this.itemRef.delete().then(() => {
      // if (filePath!=='') this.deleteImage(filePath);
    });
  }

  // getDirectories(categoryId: string, startIndex: number) {
  //     return this.http.post(environment.api + 'directories/category/' + categoryId + '/' + startIndex, { directoryCategoryId: categoryId, startIndex: startIndex }, { headers: this.getHeader() });
  // }

  // activate(email: string) {
  //     return this.http.post(environment.api + 'users/activate?email=' + email, email, { headers: this.getHeaderNodeRed() });
  // }

  // paid(request) {
  //     return this.http.post(environment.api + 'users/paid', request, { headers: this.getHeader() });
  // }

  // payfast(token, action, header) {
  //     switch (action) {
  //         case 'fetch':
  //             return this.http.get('https://api.payfast.co.za/subscriptions/' + token + '/' + action + (environment.pfHost == 'sandbox' ? '?testing=true' : ''), { headers: new HttpHeaders(header) });
  //         case 'pause':
  //             return this.http.put('https://api.payfast.co.za/subscriptions/' + token + '/' + action + (environment.pfHost == 'sandbox' ? '?testing=true' : ''), { headers: new HttpHeaders(header) });
  //         case 'unpause':
  //             return this.http.put('https://api.payfast.co.za/subscriptions/' + token + '/' + action + (environment.pfHost == 'sandbox' ? '?testing=true' : ''), { headers: new HttpHeaders(header) });
  //         case 'cancel':
  //             return this.http.put('https://api.payfast.co.za/subscriptions/' + token + '/' + action + (environment.pfHost == 'sandbox' ? '?testing=true' : ''), { headers: new HttpHeaders(header) });
  //         case 'update':
  //             return this.http.patch('https://api.payfast.co.za/subscriptions/' + token + '/' + action + (environment.pfHost == 'sandbox' ? '?testing=true' : ''), { headers: new HttpHeaders(header) });
  //         case 'adhoc':
  //             return this.http.post('https://api.payfast.co.za/subscriptions/' + token + '/' + action + (environment.pfHost == 'sandbox' ? '?testing=true' : ''), { headers: new HttpHeaders(header) });
  //         default:
  //             return null;
  //     }
  // }

  // updatePayfast(token: string, amount: number, custom_int1: number, custom_int2: number, custom_int3: number, custom_int4: number, custom_int5: number) {
  //     return this.http.post(environment.api + 'payfast/update', { token: token, amount_gross: amount, custom_int1: custom_int1, custom_int2: custom_int2, custom_int3: custom_int3, custom_int4: custom_int4, custom_int5: custom_int5 }, { headers: this.getHeader() });
  // }

  // deleteUser(email: string) {
  //     return this.http.post(environment.api + 'users/delete?email=' + email, email, { headers: this.getHeaderNodeRed() });
  // }

  getUserPermissions(id: string) {
    this.itemsRef = this.firestore.collection('permissions/' + id);
    return this.itemsRef.valueChanges({ idField: 'id' });
  }

  // saveLocation(deviceId, lat, lon): Observable<any> {
  //     //return this.http.post<any>(environment.nodeApi + '/devices/location', { deviceId: deviceId, lat: lat, lon: lon });
  //     return this.http.post<any>(environment.api + 'devices/location', { id: deviceId, lat: lat, lon: lon });
  // }

  // getDevice(id, lat, lon) {
  //     //return this.http.get<any>(environment.nodeApi + '/devices/' + id);
  //     return this.http.get<any>(environment.api + 'devices/' + id + '/' + lat + '/' + lon);
  // }

  // email(id, email) {
  //     return this.http.post(environment.api + 'users/email', { id: id, email: email });
  // }

  updateProfile(uid: string, data: any, avatarChanged: boolean): Promise<void> {
    return this.fireAuth.currentUser.then((user) => {
      if (user) {
        this.firestore.collection('users').doc(user.uid).set({
          role: data.item.role,
          company: data.item.company,
          phoneNumber: data.item.phoneNumber
        }).then(async () => {
          if (avatarChanged) {
            const fullPathInStorage = await this.uploadImage('users', user.uid, data.item.photoURL);
            const currentImageUrl = await this.fireStorage
              .ref(fullPathInStorage)
              .getDownloadURL()
              .toPromise();
            user.updateProfile({
              displayName: data.item.displayName,
              photoURL: currentImageUrl
            });
          } else {
            user.updateProfile({
              displayName: data.item.displayName
            });
          }
        })
      }
    });
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

      return result.ref.fullPath;
    } else {
      return '';
    }
  }

  // async deleteImage(path: string): Promise<Observable<any>> {
  //   return this.fireStorage.ref(path).delete();
  // }

  // updatePayfast(token: string, amount: number, custom_int1: number, custom_int2: number, custom_int3: number, custom_int4: number, custom_int5: number) {
  //   return this.http.post(environment.api + 'payfast/update', { token: token, amount_gross: amount, custom_int1: custom_int1, custom_int2: custom_int2, custom_int3: custom_int3, custom_int4: custom_int4, custom_int5: custom_int5 }, { headers: this.getHeader() });
  // }
}