import {Component} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import {map} from "rxjs";


//Metadata
export interface RouteInfo {
    path: string;
    title: string;
    type: string;
    collapse?: string;
    icontype: string;
    children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: string;
    title: string;
    ab: string;
    type?: string;
}

export const ROUTE_PROFILE: RouteInfo[] = [
    {
        path: '/profile',
        title: 'Profile',
        type: 'link',
        icontype: 'nc-icon nc-paper'
    }]
export const ROUTES: RouteInfo[] = [
    {
        path: '/dashboard',
        title: 'Dashboard',
        type: 'link',
        icontype: 'nc-icon nc-bank'
    }, {
        path: '/components',
        title: 'Projects',
        type: 'sub',
        collapse: 'components',
        icontype: 'nc-icon nc-briefcase-24',
        children: [
            {path: 'stacks', title: 'Stacks', ab: 'S'},
            {path: 'projects', title: 'Projects', ab: 'P'},
            {path: 'credentials', title: 'Credentials', ab: 'C'}
        ]
    }, {
        path: '/components/templates',
        title: 'Templates',
        type: 'link',
        icontype: 'nc-icon nc-paper'
    }, {
        path: '/dashboard',
        title: 'Costs (coming)',
        type: 'sub',
        collapse: 'forms',
        icontype: 'nc-icon nc-money-coins',
        children: [
            {path: '/dashboard', title: 'Monthly', ab: 'RF'},
            {path: '/dashboard', title: 'Yearly', ab: 'EF'},
            {path: '/dashboard', title: 'Forecast', ab: 'VF'},
            {path: '/dashboard', title: 'By Project', ab: 'W'}
        ]
    }, {
        path: '/dashboard',
        title: 'Maps (coming)',
        type: 'sub',
        collapse: 'maps',
        icontype: 'nc-icon nc-pin-3',
        children: [
            {path: '/dashboard', title: 'Google Maps', ab: 'GM'},
            {path: '/dashboard', title: 'Full Screen Map', ab: 'FSM'},
            {path: '/dashboard', title: 'Vector Map', ab: 'VM'}
        ]
    }
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent {
    public menuItems: any[];
    public menuProfile: any[];

    user$ = this.auth.user$;
    code$ = this.user$.pipe(map((user) => JSON.stringify(user, null, 2)));

    constructor(public auth: AuthService) {}

    isNotMobileMenu() {
        if (window.outerWidth > 991) {
            return false;
        }
        return true;
    }

    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
        this.menuProfile = ROUTE_PROFILE.filter(menuItem => menuItem);

    }

    ngAfterViewInit() {
    }
}
