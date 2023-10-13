import {Routes} from '@angular/router';
import {AuthGuard} from '@auth0/auth0-angular';
import {AdminLayoutComponent} from './layouts/admin/admin-layout.component';
import {ProfileComponent} from "./profile/profile.component";

export const AppRoutes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        canActivate: [AuthGuard],
        pathMatch: 'full',
    },
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                loadChildren: () => import('./dashboard/dashboard.module').then(x => x.DashboardModule)
            },
            {
                path: 'components',
                loadChildren: () => import('./components/components.module').then(x => x.ComponentsModule)
            },
            {
                path: 'profile',
                component: ProfileComponent
            }
        ]
    },
    {
        path: '',
        children: [{
            path: 'login'
        }]
    }
];
