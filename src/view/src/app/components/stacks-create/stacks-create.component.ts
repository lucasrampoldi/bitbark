import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {StackService} from "../../services/stack.service";
import {CStackObjectAdd} from "../../class/CStackObjectAdd";
import {CProjectItem} from "../../class/CProjectItem";
import {Title} from "@angular/platform-browser";
import {CCredentialItem} from "../../class/CCredentialItem";
import {ProjectService} from "../../services/project.service";
import {CTemplateItem} from "../../class/CTemplateItem";
import {HttpResponse} from "@angular/common/http";

declare var $: any;

@Component({
    selector: 'app-stacks-create',
    templateUrl: './stacks-create.component.html',
    styleUrls: ['./stacks-create.component.css']
})

export class StacksCreateComponent implements OnInit {
    pattern = /##(.*?)##/g;
    myForm: FormGroup;
    formGroupFields = {};
    fields: string[] = [];

    projects: CProjectItem[];
    credentials: CCredentialItem[] = []
    templates: CTemplateItem[] = []
    templateInputs: string[] = []
    projectIdByTenant: number
    templateIndex: number
    selectedCredential: CCredentialItem

    constructor(private fb: FormBuilder, private stackService: StackService, private projectService: ProjectService,
                private router: Router, private titleService: Title, private route: ActivatedRoute) {
        this.myForm = this.fb.group({
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            projectIdByTenant: ['', [Validators.required]],
            credentialByTenant: ['', [Validators.required]],
            region: ['', [Validators.required]],
            templateIndex: ['', [Validators.required]],
            dynamicControls: this.fb.array([]),
        });
        //this.registerForm = this.fb.group({})
        this.titleService.setTitle("Create stack");
    }

    ngOnInit() {
        this.projects = this.route.snapshot.data['project'].body['content'];
        this.templates = this.route.snapshot.data['template'].body['content'];
    }

    createStack(formGroup: FormGroup) {
        let stackObjectAdd: CStackObjectAdd = new CStackObjectAdd;
        stackObjectAdd.Name = formGroup.controls['name'].value;
        stackObjectAdd.Description = formGroup.controls['description'].value;
        stackObjectAdd.ProjectId = Number(formGroup.controls['projectIdByTenant'].value);
        stackObjectAdd.CredentialId = Number(formGroup.controls['credentialByTenant'].value);
        stackObjectAdd.Region = formGroup.controls['region'].value;

        const dynamicControlsArray = this.myForm.get('dynamicControls') as FormArray;
        const regex = /##([^#]+)##/g;
        let currentIndex = 0;
        stackObjectAdd.Template =  this.templates[Number(formGroup.controls['templateIndex'].value)].Template.replace(regex, (_match, capture) => {
            const replacement = dynamicControlsArray.at(currentIndex).value;
            currentIndex = (currentIndex + 1) % dynamicControlsArray.length;
            return "'" + replacement + "'" || `##${capture}##`;
        });
        stackObjectAdd.TemplateProperties = this.templates[Number(formGroup.controls['templateIndex'].value)].Engine
        stackObjectAdd.TemplatePermission = this.templates[Number(formGroup.controls['templateIndex'].value)].Policy

        this.stackService
            .add(stackObjectAdd)
            .subscribe({
                    next: (response: HttpResponse<any>) => {
                        if (response.status != 200) {
                            this.showNotification('top', 'center', 3, response.statusText)
                        } else {
                            this.router.navigate(['/components/stacks']).then(r => null)
                        }
                    },
                    error: (error) => {
                        this.showNotification('top', 'center', 3, error)
                        this.router.navigate(['/components/stacks']).then(r => null)
                    }
                }
            );
    }

    setCredential(event){
        const value = event.target.value;
        this.selectedCredential = this.credentials[value-1]

    }

    getCredentials() {
        this.credentials = []
        this.myForm.controls['credentialByTenant'].setValue("");
        this.projectService.getCredentials(this.projectIdByTenant)
            .subscribe({
                next: (response: HttpResponse<any>) => {
                    if (response.status != 200) {
                        this.showNotification('top', 'center', 3, response.statusText)
                    } else if (response.body.content != null) {
                        for (let i = 0; i < response.body.content.length; i++) {
                            let credential = new CCredentialItem()
                            credential.Name = response.body.content[i].Name
                            credential.Description = response.body.content[i].Description
                            credential.IdByTenant = response.body.content[i].IdByTenant
                            credential.ProjectName = response.body.content[i].ProjectName
                            credential.Account = response.body.content[i].Account
                            credential.AccessKeyMask = response.body.content[i].AccessKeyMask
                            credential.Provider = response.body.content[i].Provider
                            credential.CreatedAt = response.body.content[i].CreatedAt
                            credential.UpdatedAt = response.body.content[i].UpdatedAt
                            this.credentials.push(credential);
                        }
                    }
                },
                error: (error) => {
                    this.showNotification('top', 'center', 3, error)
                }
            });
    }

    selectTemplate() {
        this.fields = []
        this.dynamicControls.clear();
        for (let i = 0; i < this.templates[this.templateIndex].Template.match(this.pattern).length; i++) {
            this.formGroupFields[this.templates[this.templateIndex].Template.match(this.pattern)[i]] = new FormControl("");
            const control = this.fb.control('', [Validators.required]);
            this.dynamicControls.push(control);
            this.fields.push(this.templates[this.templateIndex].Template.match(this.pattern)[i]);
        }
    }

    get dynamicControls() {
        return this.myForm.get('dynamicControls') as FormArray;
    }

    showNotification(from, align, color, message) {
        var type = ['info', 'success', 'warning', 'danger'];

        $.notify({
            icon: "ti-gift",
            message: message
        }, {
            type: type[color],
            timer: 4000,
            placement: {
                from: from,
                align: align
            },
            template: '<div data-notify="container" class="col-11 col-md-4 alert alert-{0} alert-with-icon" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss"><i class="nc-icon nc-simple-remove"></i></button><span data-notify="icon" class="nc-icon nc-bell-55"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
        });
    }

}
