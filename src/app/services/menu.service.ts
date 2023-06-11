import { EventEmitter, Injectable } from '@angular/core';
import { PageLayout } from '../interfaces/pageLayout';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';
import { User } from '../interfaces/user';
import { LoadingService } from './loading.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  invokeChangePageFunction = new EventEmitter();
  invokeChangeMenuFunction = new EventEmitter();
  invokeChangeSubMenuFunction = new EventEmitter();

  public selectedItem: string = 'home';
  public pageSelected: string = "dashboard";
  public menuSelected: string = "";
  public subMenuSelected: string = "";
  private subMenuSelectedSource = new BehaviorSubject('');
  public subMenu = this.subMenuSelectedSource.asObservable();

  public static pages: PageLayout[] = [
    {
      level: 1,
      label: 'Email Not Confirmed',
      value: 'not-confirmed',
      valueParent: '',
      type: 'page',
      icon: 'home',
      children: [],
      location: 'logo',
      roles: 'admin,load,vehicle,driver,provider,public'
    },
    {
      level: 1,
      label: 'Home',
      value: 'home',
      valueParent: '',
      type: 'page',
      icon: 'home',
      children: [],
      location: 'logo',
      roles: 'admin,load,vehicle,driver,provider,public'
    },
    {
      level: 1,
      label: 'Dashboard',
      value: 'dashboard',
      valueParent: '',
      type: 'page',
      icon: 'dashboard',
      children: [],
      location: 'top-right',
      roles: 'admin,load,vehicle,driver,provider'
    },
    {
      level: 1,
      label: 'Admin',
      value: 'admin',
      valueParent: '',
      type: 'container',
      icon: 'tune',
      children: [
        {
          level: 2,
          label: 'Lookups',
          value: 'lookups',
          valueParent: 'admin',
          type: 'page',
          icon: 'manage_search',
          children: [],
          location: 'menu',
          roles: 'admin'
        },
        {
          level: 2,
          label: 'Settings',
          value: 'settings',
          valueParent: 'admin',
          type: 'container',
          icon: 'manage_account',
          children: [
            {
              level: 3,
              label: 'Profile',
              value: 'profile',
              valueParent: 'settings',
              type: 'page',
              icon: 'account_circle',
              children: [],
              location: 'menu',
              roles: 'admin,load,vehicle,driver,provider'
            },
            // {
            //   level: 3,
            //   label: 'Security',
            //   value: 'security',
            //   valueParent: 'settings',
            //   type: 'page',
            //   icon: 'password',
            //   children: [],
            //   location: 'menu',
            //   roles: 'admin,load,vehicle,driver,provider'
            // },
            {
              level: 3,
              label: 'Plan & Billing',
              value: 'account',
              valueParent: 'settings',
              type: 'page',
              icon: 'rule',
              children: [],
              location: 'menu',
              roles: 'admin,load,vehicle,driver,provider'
            }
          ],
          location: 'menu',
          roles: 'admin,load,vehicle,driver,provider'
        }
      ],
      location: 'bottom',
      roles: 'admin,load,vehicle,driver,provider'
    },
    {
      level: 1,
      label: 'Fleet',
      value: 'fleet',
      valueParent: '',
      type: 'container',
      icon: 'commute',
      children: [
        {
          level: 2,
          label: 'My Vehicles',
          value: 'vehicles',
          valueParent: 'fleet',
          type: 'page',
          icon: 'local_shipping',
          children: [],
          location: 'menu',
          roles: 'admin,vehicle'
        },
        {
          level: 2,
          label: 'My Drivers',
          value: 'drivers',
          valueParent: 'fleet',
          type: 'page',
          icon: 'settings_accessibility',
          children: [],
          location: 'menu',
          roles: 'admin,vehicle'
        },
        {
          level: 2,
          label: 'Transport Mangement System',
          value: 'fleet-tms',
          valueParent: 'fleet',
          type: 'page',
          icon: 'edit_road',
          children: [],
          location: 'menu',
          roles: 'admin,vehicle'
        }
      ],
      location: 'bottom',
      roles: 'admin,vehicle'
    },
    {
      level: 1,
      label: 'Loads',
      value: 'load',
      valueParent: '',
      type: 'container',
      icon: 'fire_truck',
      children: [
        {
          level: 2,
          label: 'My Loads',
          value: 'loads',
          valueParent: 'load',
          type: 'page',
          icon: 'shopping_cart',
          children: [],
          location: 'menu',
          roles: 'admin,load'
        },
        {
          level: 2,
          label: 'Loads Available',
          value: 'loads-available',
          valueParent: 'load',
          type: 'page',
          icon: 'add_shopping_cart',
          children: [
            {
              level: 3,
              label: 'Map',
              value: 'map',
              valueParent: 'loads-available',
              type: 'tab',
              icon: 'map',
              children: [],
              location: 'map',
              roles: 'admin,vehicle'
            },
            {
              level: 3,
              label: 'Table',
              value: 'table',
              valueParent: 'loads-available',
              type: 'tab',
              icon: 'table',
              children: [],
              location: 'map',
              roles: 'admin,vehicle'
            }
          ],
          location: 'menu',
          roles: 'admin,vehicle'
        },
        {
          level: 2,
          label: 'Transport Mangement System',
          value: 'load-tms',
          valueParent: 'load',
          type: 'page',
          icon: 'edit_road',
          children: [],
          location: 'menu',
          roles: 'admin,vehicle'
        }
      ],
      location: 'bottom',
      roles: 'admin,load,vehicle'
    },
    {
      level: 1,
      label: 'Bids',
      value: 'bids',
      valueParent: '',
      type: 'page',
      icon: 'back_hand',
      children: [],
      location: 'bottom',
      roles: 'admin,vehicle'
    },
    {
      level: 1,
      label: 'Marketing',
      value: 'marketing',
      valueParent: '',
      type: 'container',
      icon: 'campaign',
      children: [
        {
          level: 2,
          label: 'Adverts',
          value: 'adverts',
          valueParent: 'marketing',
          type: 'page',
          icon: 'hotel_class',
          children: [],
          location: 'menu',
          roles: 'admin,provider'
        },
        {
          level: 2,
          label: 'Directories',
          value: 'directories',
          valueParent: 'marketing',
          type: 'page',
          icon: 'folder_open',
          children: [],
          location: 'menu',
          roles: 'admin,provider'
        },
        {
          level: 2,
          label: 'Bus-D',
          value: 'business-directory',
          valueParent: 'marketing',
          type: 'page',
          icon: 'fact_check',
          children: [],
          location: 'menu',
          roles: 'admin,provider'
        }
      ],
      location: 'bottom',
      roles: 'admin,provider'
    }
  ];

  userLogged!: User;

  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.getUserLogged();
  }

  changeSubMenu(val: string) {
    this.subMenuSelectedSource.next(val);
  }

  async getUserLogged() {
    this.userLogged = JSON.parse((await Preferences.get({ key: 'user' })).value!) as User;
    if(!this.userLogged) {this.userLogged = {uid: '', role: 'public'} };
  }

  getPage(location: string): PageLayout[] {
    if(!this.userLogged) {this.userLogged = {uid: '', role: 'public'} };
    return MenuService.pages.filter(x => x.location === location && (x.roles.indexOf(this.userLogged!.role!) >= 0 || x.roles.indexOf('public') >= 0));
  }

  getMenu(): PageLayout[] {
    return this.getItem(this.pageSelected)?.children.filter(x => x.roles.indexOf(this.userLogged!.role!) >= 0) ?? [];
  }

  getSubMenu(): PageLayout[] {
    return this.getItem(this.menuSelected)?.children.filter(x => x.roles.indexOf(this.userLogged!.role!) >= 0) ?? [];
  }

  findInNestedArray(value: string, array: PageLayout[]): PageLayout | undefined {
    for (const item of array) {
      if (item.value === value) {
        return item;
      }
      if (item.children.filter(x => x.roles.indexOf(this.userLogged!.role!) >= 0).length > 0) {
        const found = this.findInNestedArray(value, item.children.filter(x => x.roles.indexOf(this.userLogged!.role!) >= 0));
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  getItem(value: string): PageLayout | undefined {
    if(!this.userLogged) {this.userLogged = {uid: '', role: 'public'} };
    return this.findInNestedArray(value, MenuService.pages)! ?? undefined;
  }
  async selectItem(value: string) {
    this.userLogged = JSON.parse((await Preferences.get({ key: 'user' })).value!) as User;
    if(!this.userLogged) {this.userLogged = {uid: '', role: 'public'} };

    let item = this.getItem(value);
    let child = this.getItem(item?.children.filter(x => x.roles.indexOf(this.userLogged!.role!) >= 0)[0]?.value! ?? undefined) ?? undefined;
    let grandChild = this.getItem(child?.children.filter(x => x.roles.indexOf(this.userLogged!.role!) >= 0)[0]?.value! ?? undefined) ?? undefined;
    let parent = this.getItem(item?.valueParent! ?? undefined) ?? undefined;
    let grandParent = this.getItem(parent?.valueParent! ?? undefined) ?? undefined;

    // if (item) { console.log('item', item); }
    // if (child) { console.log('child', child); }
    // if (grandChild) { console.log('grandChild', grandChild); }
    // if (parent) { console.log('parent', parent); }
    // if (grandParent) { console.log('grandParent', grandParent); }


    switch (item!.level) {
      case 1:
        this.pageSelected = item?.value ?? '';
        this.menuSelected = child ? child.value : '';// (this.getChildren(value)?.length! > 0 ? this.getChildren(value)![0]!.value! : '') ?? '';
        this.subMenuSelected = grandChild ? grandChild.value : '';// this.menuSelected != '' ? (this.getChildren(this.menuSelected)?.length! > 0 ? this.getChildren(value)![0]!.value! : '') ?? '' : '';
        this.subMenuSelectedSource.next(this.subMenuSelected);
        break;
      case 2:
        this.pageSelected = parent ? parent.value : '';// this.getParent(value)?.label ?? '';
        this.menuSelected = item?.value ?? '';
        this.subMenuSelected = child ? child.value : '';// (this.getChildren(value)?.length! > 0 ? this.getChildren(value)![0]!.value! : '') ?? '';;
        this.subMenuSelectedSource.next(this.subMenuSelected);
        break;
      case 3:
        this.pageSelected = grandParent ? grandParent.value : '';// this.getParent(item?.valueParent!)?.label ?? '';
        this.menuSelected = parent ? parent.value : '';// this.getParent(value)?.label ?? '';
        this.subMenuSelected = item?.value ?? '';
        this.subMenuSelectedSource.next(this.subMenuSelected);
        break;
      default:
        break;
    }

    // Preferences.set({ key: 'pageSelected', value: this.pageSelected });
    // Preferences.set({ key: 'menuSelected', value: this.menuSelected });
    // Preferences.set({ key: 'subMenuSelected', value: this.subMenuSelected });

    if (grandChild) {
      if (grandChild.type === 'tab') {
        this.selectedItem = child ? child!.value : item!.value;
        Preferences.set({ key: 'selectedItem', value: child ? child!.value : await this.validateRedirect(item!.value!)! })!;
        this.router.navigate(['/' + child ? child!.value : await this.validateRedirect(item!.value!)]);
      } else {
        this.selectedItem = grandChild.value;
        Preferences.set({ key: 'selectedItem', value: await this.validateRedirect(grandChild!.value!)! });
        this.router.navigate(['/' + await this.validateRedirect(grandChild!.value!)!]);
      }
    } else if (child) {
      if (child.type === 'tab') {
        this.selectedItem = item!.value;
        Preferences.set({ key: 'selectedItem', value: await this.validateRedirect(item!.value)! });
        this.router.navigate(['/' + await this.validateRedirect(item!.value!)])!;
      } else {
        this.selectedItem = child.value;
        Preferences.set({ key: 'selectedItem', value: await this.validateRedirect(child!.value!)! });
        this.router.navigate(['/' + await this.validateRedirect(child!.value!)!]);
      }
    } else {
      if (item!.type === 'tab') {
        this.selectedItem = parent!.value;
        Preferences.set({ key: 'selectedItem', value: await this.validateRedirect(parent!.value!)! });
        this.setSelections(item!.value);
      } else {
        this.selectedItem = item?.value!;
        Preferences.set({ key: 'selectedItem', value: await this.validateRedirect(item?.value!)! });
        this.router.navigate(['/' + await this.validateRedirect(item?.value!)!]);
      }
    }
  }
  getMenuLabel(): string {
    return this.getLabel(this.getItem(this.selectedItem!)!);// + ' ||| ' + this.pageSelected + '.' + this.menuSelected + '.' + this.subMenuSelected;
  }
  getLabel(item: PageLayout): string {
    let parent = this.getItem(item?.valueParent! ?? undefined) ?? undefined;
    let grandParent = this.getItem(parent?.valueParent! ?? undefined) ?? undefined;

    switch (item.level) {
      case 1:
        return this.getItem(item.value)!.label! ?? '';
      case 2:
        return (parent ? parent.label + ' | ' : '' ?? '') + (this.getItem(item.value)?.label! ?? '');
      case 3:
        return (grandParent ? grandParent.label + ' | ' : '' ?? '') + (parent ? parent.label + ' | ' : '' ?? '') + (this.getItem(item.value)?.label! ?? '');
      default:
        return '';
    }
  }
  async validateRedirect(item: string): Promise<string> {
    if (item == undefined) return 'home';
    if (item == 'home' || item == 'not-found' || item == 'terms-and-conditions' || item == 'privacy-policy' || item == 'authentication') {
      return item;
    } else {

      if (!this.userLogged) {
        this.setSelectionsNotValidated('home', 'home', '', '');
        return 'home';
      } else if (!this.userLogged.emailVerified) {
        this.setSelectionsNotValidated('not-confirmed', 'not-confirmed', '', '');
        return 'not-confirmed';
      } else if (!this.userLogged.role) {
        await Preferences.set({ key: 'profile-not-completed', value: '1' });
        this.setSelectionsNotValidated('profile', 'admin', 'settings', 'profile');
        return 'profile';
      } else if (this.userLogged && this.userLogged.emailVerified && this.userLogged.role) {
        this.setSelections(this.selectedItem);
        return item;
      } else {
        return 'home';
      }
    }
  }
  setSelectionsNotValidated(selectedItem: string, pageSelected: string, menuSelected: string, subMenuSelected: string): void {
    this.selectedItem = selectedItem;
    this.pageSelected = pageSelected;
    this.menuSelected = menuSelected;
    this.subMenuSelected = subMenuSelected;
    this.subMenuSelectedSource.next(subMenuSelected);

    Preferences.set({ key: 'selectedItem', value: selectedItem });
    Preferences.set({ key: 'pageSelected', value: this.pageSelected });
    Preferences.set({ key: 'menuSelected', value: this.menuSelected });
    Preferences.set({ key: 'subMenuSelected', value: this.subMenuSelected });

    this.invokeChangePageFunction.emit(pageSelected);
    this.invokeChangeMenuFunction.emit(menuSelected);
    this.invokeChangeSubMenuFunction.emit(subMenuSelected);
    console.log('this.subMenuSelected', this.subMenuSelected);
  }
  setSelections(selectedItem: string): void {
    Preferences.set({ key: 'selectedItem', value: selectedItem });
    Preferences.set({ key: 'pageSelected', value: this.pageSelected });
    Preferences.set({ key: 'menuSelected', value: this.menuSelected });
    Preferences.set({ key: 'subMenuSelected', value: this.subMenuSelected });

    this.invokeChangePageFunction.emit(this.pageSelected);
    this.invokeChangeMenuFunction.emit(this.menuSelected);
    this.invokeChangeSubMenuFunction.emit(this.subMenuSelected);
    console.log('this.subMenuSelected', this.subMenuSelected);
  }
}
