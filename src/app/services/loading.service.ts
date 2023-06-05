import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  userInactive: Subject<any> = new Subject();

  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  async getLoading(): Promise<boolean> {
    const item = await Preferences.get({ key: 'loadingCount' });
    return (Number(item.value)! ?? false) > 0;
  }

  async setLoading(loading: boolean, from: string): Promise<void> {
    const item = await Preferences.get({ key: 'loadingCount' });
    if (loading) {
      await Preferences.set({ key: 'loadingCount', value: (Number(item) + 1).toString() });
      this.loadingSubject.next(true)
    } else {
      await Preferences.set({ key: 'loadingCount', value: (Number(item) - 1).toString() });
      const result = await Preferences.get({ key: 'loadingCount' });
      this.loadingSubject.next(Number(result.value) > 0);
      if (Number(result.value) < 0) {
        this.setLoading(true, '');
      }
    }
  }

  // constructor() { }

  // setLoading(loading: boolean, from:string) {
  //   // //console.log(from, loading);
  //   // Preferences.get({key: 'loadingCount'}).then(loadingCount => {
  //   //   if(loading){      
  //   //     Preferences.set({key: 'loadingCount', value: (Number(loadingCount) + 1).toString()});
  //   //   }else{
  //   //     Preferences.set({key: 'loadingCount', value: (Number(loadingCount) - 1).toString()});
  //   //   }
  //   // });
  // }

  // async getLoading(): Promise<boolean> {
  //   return false;//Number((await Preferences.get({key: 'loadingCount'})).value) > 0;
  // }
}