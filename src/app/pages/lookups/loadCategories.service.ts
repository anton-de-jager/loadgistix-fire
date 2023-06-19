import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { loadCategory } from 'src/app/models/loadCategory.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadCategoryService {
  constructor(private firestore: AngularFirestore) {}

  firestoreLoadCategoryCollection = this.firestore.collection<loadCategory>('loadCategories');

  //READ
  //loadCategories$ = (this.firestore.collection<loadCategory>('loadCategories', ref => ref.where('userId', '==', userId))).snapshotChanges().pipe(
  loadCategories$ = this.firestoreLoadCategoryCollection.snapshotChanges().pipe(
    map(actions => {
      return actions.map(p => {
        const loadCategory = p.payload.doc;
        const id = loadCategory.id;
        return { id, ...loadCategory.data() } as loadCategory;
      });
    })
  );

  //CREATE
  async addLoadCategory(data: loadCategory): Promise<void> {
    try {
      await this.firestoreLoadCategoryCollection.add(data);
    } catch (err) {
      console.log(err);
    }
  }

  //UPDATE
  async updateLoadCategory(id: string, item: loadCategory): Promise<void> {
    try {
      await this.firestoreLoadCategoryCollection
        .doc(id)
        .update(item);
    } catch (err) {
      console.log(err);
    }
  }

  //DELETE
  async deleteLoadCategory(id: string): Promise<void> {
    try {
      await this.firestoreLoadCategoryCollection.doc(id).delete();
    } catch (err) {
      console.log(err);
    }
  }
}