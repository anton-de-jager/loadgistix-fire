export interface PageLayout {
    level: number;
    label: string;
    value: string;
    valueParent: string;
    type: string;
    icon: string;
    children: PageLayout[];
    location: string;
    roles: string;
}
