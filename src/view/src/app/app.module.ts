import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AppComponent} from './app.component';
import {SidebarModule} from './sidebar/sidebar.module';
import {NavbarModule} from './shared/navbar/navbar.module';
import {AdminLayoutComponent} from './layouts/admin/admin-layout.component';
import {AppRoutes} from './app.routing';
import {AuthHttpInterceptor, AuthModule} from "@auth0/auth0-angular";
import {CommonModule} from "@angular/common";
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {DashboardResolver} from "./resolver/dashboard-resolver.service";
import {ProjectResolver} from "./resolver/project-resolver.service";
import {ProjectService} from "./services/project.service";
import {StackResolver} from "./resolver/stack-resolver.service";
import {StackService} from "./services/stack.service";
import {CredentialResolver} from "./resolver/credential-resolver.service";
import {CredentialService} from "./services/credential.service";
import {TemplateResolver} from "./resolver/template-resolver.service";
import {CredentialIdResolver} from "./resolver/credential-id-resolver.service";
import {ProjectIdResolver} from "./resolver/project-id-resolver.service";
import {StackIdResolver} from "./resolver/stack-id-resolver.service";
import {Constants} from "./constants";

@NgModule({
    imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot(AppRoutes, {
            useHash: true
        }),
        NgbModule,
        SidebarModule,
        NavbarModule,
        RouterModule,
        CommonModule,
        AuthModule.forRoot({
            domain: Constants.AUTH0_DOMAIN,
            clientId: Constants.AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: window.location.origin,
                audience: 'backend',
            },
            httpInterceptor: {
                allowedList: [

                    {
                        uri: Constants.API_ENDPOINT+"/*"
                    }
                ]
            }
        }),
        HttpClientModule
    ],
    declarations: [
        AppComponent,
        AdminLayoutComponent
    ],
    providers: [
        ProjectResolver,
        ProjectIdResolver,
        ProjectService,
        StackResolver,
        StackIdResolver,
        StackService,
        CredentialResolver,
        CredentialIdResolver,
        CredentialService,
        TemplateResolver,
        DashboardResolver,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthHttpInterceptor,
            multi: true,
        }
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}
