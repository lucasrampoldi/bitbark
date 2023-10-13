import {Routes} from '@angular/router';
import {ProjectsComponent} from "./projects/projects.component";
import {ProjectResolver} from "../resolver/project-resolver.service";
import {ProjectsCreateComponent} from "./projects-create/projects-create.component";
import {CredentialsComponent} from "./credentials/credentials.component";
import {CredentialResolver} from "../resolver/credential-resolver.service";
import {CredentialsCreateComponent} from "./credentials-create/credentials-create.component";
import {CredentialsDetailComponent} from "./credentials-detail/credentials-detail.component";
import {TemplatesComponent} from "./templates/templates.component";
import {TemplateResolver} from "../resolver/template-resolver.service";
import {StackResolver} from "../resolver/stack-resolver.service";
import {StacksComponent} from "./stacks/stacks.component";
import {StacksCreateComponent} from "./stacks-create/stacks-create.component";
import {StacksDetailComponent} from "./stacks-detail/stacks-detail.component";
import {ProjectsDetailComponent} from "./projects-detail/projects-detail.component";
import {StackIdResolver} from "../resolver/stack-id-resolver.service";
import {ProjectIdResolver} from "../resolver/project-id-resolver.service";
import {CredentialIdResolver} from "../resolver/credential-id-resolver.service";


export const ComponentsRoutes: Routes = [
    {
        path: 'stacks',
        children: [{
            path: '',
            component: StacksComponent,
            resolve: {
                stack: StackResolver
            }
        }, {
            path: 'create',
            component: StacksCreateComponent,
            resolve: {
                project: ProjectResolver,
                stack: StackResolver,
                template: TemplateResolver
            }
        }, {
            path: ':id',
            component: StacksDetailComponent,
            resolve: {
                stack: StackIdResolver
            }
        }]
    }, {
        path: 'projects',
        children: [{
            path: '',
            component: ProjectsComponent,
            resolve: {
                project: ProjectResolver
            }
        }, {
            path: 'create',
            component: ProjectsCreateComponent
        }, {
            path: ':id',
            component: ProjectsDetailComponent,
            resolve: {
                project: ProjectIdResolver
            }
        }
        ],
    }, {
        path: 'credentials',
        children: [{
            path: '',
            component: CredentialsComponent,
            resolve: {
                credential: CredentialResolver
            }
        }, {
            path: 'create',
            component: CredentialsCreateComponent,
            resolve: {
                project: ProjectResolver
            }
        }, {
            path: ':id',
            component: CredentialsDetailComponent,
            resolve: {
                credential: CredentialIdResolver
            }
        }],
    }, {
        path: 'templates',
        component: TemplatesComponent,
        resolve: {
            template: TemplateResolver
        }
    }
];
