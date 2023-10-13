import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ComponentsRoutes} from './components.routing';
import {ProjectsComponent} from "./projects/projects.component";
import {HttpClientModule} from "@angular/common/http";
import {ProjectsCreateComponent} from "./projects-create/projects-create.component";
import {CredentialsCreateComponent} from "./credentials-create/credentials-create.component";
import {CredentialsComponent} from "./credentials/credentials.component";
import {CredentialsDetailComponent} from "./credentials-detail/credentials-detail.component";
import {TemplatesComponent} from "./templates/templates.component";
import {StacksDetailComponent} from "./stacks-detail/stacks-detail.component";
import {StacksComponent} from "./stacks/stacks.component";
import {StacksCreateComponent} from "./stacks-create/stacks-create.component";
import {ProjectsDetailComponent} from "./projects-detail/projects-detail.component";
import {PrettyJsonModule} from 'angular2-prettyjson';
import {ProfileComponent} from "../profile/profile.component";

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ComponentsRoutes),
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        PrettyJsonModule
    ],
    declarations: [
        ProjectsComponent,
        ProjectsCreateComponent,
        ProjectsDetailComponent,
        StacksComponent,
        StacksCreateComponent,
        StacksDetailComponent,
        CredentialsComponent,
        CredentialsCreateComponent,
        CredentialsDetailComponent,
        TemplatesComponent,
        ProfileComponent
    ]
})

export class ComponentsModule {
}
