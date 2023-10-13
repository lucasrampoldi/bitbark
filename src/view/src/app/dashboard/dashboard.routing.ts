import {Routes} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {DashboardResolver} from "../resolver/dashboard-resolver.service";

export const DashboardRoutes: Routes = [{

    path: '',
    children: [{
        path: 'dashboard',
        component: DashboardComponent,
        resolve: {
            dashboard: DashboardResolver
        }
    }]
}];
