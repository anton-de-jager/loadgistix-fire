import { PageLayout } from "../interfaces/pageLayout";

export class GlobalConstants {

    public static pageSelected: string = "Dashboard";
    public static menuSelected: string = "";
    public static pages:PageLayout[] = [
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
            location: 'sub-menu'
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

}