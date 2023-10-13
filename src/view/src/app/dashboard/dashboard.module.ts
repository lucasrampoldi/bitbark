import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DashboardComponent} from './dashboard.component';
import {DashboardRoutes} from './dashboard.routing';
import {DashboardResolver} from "../resolver/dashboard-resolver.service";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AuthHttpInterceptor, AuthModule} from "@auth0/auth0-angular";

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardRoutes),
        FormsModule],
    declarations: [
        DashboardComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class DashboardModule {
}
