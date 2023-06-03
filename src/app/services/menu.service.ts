import { EventEmitter, Injectable } from '@angular/core';
import { PageLayout } from '../interfaces/pageLayout';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  invokeChangePageFunction = new EventEmitter();
  invokeChangeMenuFunction = new EventEmitter();
  invokeChangeSubMenuFunction = new EventEmitter();

  public pageSelected: string = "Dashboard";
  public menuSelected: string = "";
  public subMenuSelected: string = "";
  public static pages: PageLayout[] = [
    {
      label: 'Profile',
      value: 'profile',
      icon: 'account_circle',
      children: [],
      location: 'profile'
    },
    {
      label: 'Dashboard',
      value: 'dashboard',
      icon: 'dashboard',
      children: [],
      location: 'top-right'
    },
    {
      label: 'Admin',
      value: 'admin',
      icon: 'tune',
      children: [
        {
          label: 'Lookups',
          value: 'lookups',
          icon: 'manage_search',
          children: [],
          location: 'menu'
        },
        {
          label: 'Settings',
          value: 'settings',
          icon: 'manage_account',
          children: [
            {
              label: 'Security',
              value: 'security',
              icon: 'password',
              children: [],
              location: 'menu'
            },
            {
              label: 'Plan & Billing',
              value: 'account',
              icon: 'rule',
              children: [],
              location: 'menu'
            }
          ],
          location: 'menu'
        }
      ],
      location: 'bottom'
    },
    {
      label: 'Fleet',
      value: 'fleet',
      icon: 'commute',
      children: [
        {
          label: 'My Vehicles',
          value: 'vehicles',
          icon: 'local_shipping',
          children: [],
          location: 'menu'
        },
        {
          label: 'My Drivers',
          value: 'drivers',
          icon: 'settings_accessibility',
          children: [],
          location: 'menu'
        }//,
        // {
        //     label: 'Transport Mangement System',
        //     value: 'tms',
        //     icon: 'edit_road',
        // location: 'menu'
        // }
      ],
      location: 'bottom'
    },
    {
      label: 'Loads',
      value: 'load',
      icon: 'fire_truck',
      children: [
        {
          label: 'My Loads',
          value: 'loads',
          icon: 'shopping_cart',
          children: [],
          location: 'menu'
        },
        {
          label: 'Loads Available',
          value: 'loads-available',
          icon: 'add_shopping_cart',
          children: [
            {
              label: 'Map',
              value: 'map',
              icon: 'map',
              children: [],
              location: 'map'
            },
            {
              label: 'Table',
              value: 'table',
              icon: 'table',
              children: [],
              location: 'map'
            }
          ],
          location: 'menu'
        }//,
        // {
        //     label: 'Transport Mangement System',
        //     value: 'tms',
        //     icon: 'edit_road',
        // location: 'menu'
        // }
      ],
      location: 'bottom'
    },
    {
      label: 'Bids',
      value: 'bids',
      icon: 'back_hand',
      children: [],
      location: 'bottom'
    },
    {
      label: 'Marketing',
      value: 'marketing',
      icon: 'campaign',
      children: [
        {
          label: 'Adverts',
          value: 'adverts',
          icon: 'hotel_class',
          children: [],
          location: 'menu'
        },
        {
          label: 'Directories',
          value: 'directories',
          icon: 'folder_open',
          children: [],
          location: 'menu'
        },
        {
          label: 'Bus-D',
          value: 'business-directory',
          icon: 'fact_check',
          children: [],
          location: 'menu'
        }
      ],
      location: 'top-right'
    }
  ];
  public links = [
    { icon: 'home', text: 'Home', callback: MenuService.gotoLink },
    { icon: 'dashboard', text: 'Dashboard', callback: MenuService.gotoLink }
  ];

  constructor(
    private router: Router
  ) {
    this.getPageSelected();
    this.getMenuSelected();
    this.getSubMenuSelected();
  }

  async getPageSelected() {
    this.pageSelected = (await Preferences.get({ key: 'pageSelected' })).value ?? 'Home';
  }
  async getMenuSelected() {
    this.menuSelected = (await Preferences.get({ key: 'menuSelected' })).value ?? '';
  }
  async getSubMenuSelected() {
    this.subMenuSelected = (await Preferences.get({ key: 'subMenuSelected' })).value ?? '';
  }

  onChangePage(page: string) {
    this.invokeChangePageFunction.emit(page);
  }

  onChangeMenu(menu: string) {
    this.invokeChangeMenuFunction.emit(menu);
  }

  onChangeSubMenu(subMenu: string) {
    this.invokeChangeSubMenuFunction.emit(subMenu);
  }

  getMenuLabel(): string {
    let page = MenuService.pages.find((x: { value: string | null; }) => x.value === this.pageSelected)?.label ?? '';
    let menu = MenuService.pages.find((x: { value: string | null; }) => x.value === this.pageSelected)?.children.find(y => y.value == this.menuSelected)?.label ?? '';
    return page + (menu !== '' ? ' | ' + menu : '');
  }

  getPage(location: string): PageLayout[] {
    return MenuService.pages.filter((x: { location: string; }) => x.location === location);
  }

  getMenu(): PageLayout[] {
    return MenuService.pages.find((x: { value: string | null; }) => x.value === this.pageSelected)?.children ?? [];
  }

  getSubMenu(): PageLayout[] {
    return MenuService.pages.find((x: { value: string | null; }) => x.value === this.pageSelected)?.children.find((x: { value: string | null; }) => x.value === this.menuSelected)?.children ?? [] ?? [];
  }

  selectPage(pageSelected: string) {
    Preferences.set({ key: 'pageSelected', value: pageSelected });
    this.pageSelected = pageSelected;
    this.router.navigate(['/' + pageSelected]);
    this.selectMenu('');
  }

  selectMenu(menuSelected: string) {
    if (menuSelected !== '') {
      Preferences.set({ key: 'menuSelected', value: menuSelected });
      this.menuSelected = menuSelected;
      this.router.navigate(['/' + menuSelected]);
    } else {
      let menuSelectedNew = MenuService.pages.find((x: { value: string | null; }) => x.value === this.pageSelected);
      if (menuSelectedNew?.children.length! > 0) {
        Preferences.set({ key: 'menuSelected', value: menuSelectedNew?.children[0]!.value! });
        this.menuSelected = menuSelectedNew?.children[0]!.value!;
        this.router.navigate(['/' + this.menuSelected]);
      }
    }
  }

  selectSubMenu(subMenuSelected: string) {
    if (subMenuSelected !== '') {
      Preferences.set({ key: 'subMenuSelected', value: subMenuSelected });
      this.subMenuSelected = subMenuSelected;
    } else {
      Preferences.set({ key: 'subMenuSelected', value: '' });
    }
  }

  public navigateTo(page: string, menu: string) {
    Preferences.set({ key: 'pageSelected', value: page });
    this.pageSelected = page;

    Preferences.set({ key: 'menuSelected', value: menu });
    this.menuSelected = menu;

    this.router.navigate(['/' + menu]);
  }

  private static gotoLink() {

  }
}
