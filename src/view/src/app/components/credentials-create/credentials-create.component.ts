import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CredentialService} from "../../services/credential.service";
import {CCredentialObjectAdd} from "../../class/CCredentialObjectAdd";
import {CProjectItem} from "../../class/CProjectItem";
import {Title} from "@angular/platform-browser";
import {HttpResponse} from "@angular/common/http";

declare var $: any;

@Component({
    selector: 'app-credentials-create',
    templateUrl: './credentials-create.component.html',
    styleUrls: ['./credentials-create.component.css']
})


export class CredentialsCreateComponent implements OnInit {
    myForm: FormGroup;
    projects: CProjectItem[];

    constructor(private fb: FormBuilder, private credentialService: CredentialService, private router: Router, private titleService: Title,
                private route: ActivatedRoute) {
        this.myForm = this.fb.group({
            name: ['', [Validators.required]],
            description: [''],
            projectIdByTenant: ['', [Validators.required]],
            account: ['', [Validators.required]],
            accessKey: ['', [Validators.required]],
            secretKey: ['', [Validators.required]],
        });
        this.titleService.setTitle("Create credential");
    }

    ngOnInit() {
        this.projects = this.route.snapshot.data['project'].body['content'];
    }

    createCredential(formGroup: FormGroup) {
        let  credentialObjectAdd: CCredentialObjectAdd = new CCredentialObjectAdd;
        credentialObjectAdd.Name = formGroup.controls['name'].value;
        credentialObjectAdd.Description = formGroup.controls['description'].value;
        credentialObjectAdd.ProjectId = Number(formGroup.controls['projectIdByTenant'].value);
        credentialObjectAdd.Account = formGroup.controls['account'].value;
        credentialObjectAdd.AccessKey = formGroup.controls['accessKey'].value;
        credentialObjectAdd.SecretKey = formGroup.controls['secretKey'].value;

        this.credentialService
            .add(credentialObjectAdd)
            .subscribe({
                next: (response: HttpResponse<any>) => {
                    if (response.status != 200) {
                        this.showNotification('top', 'center', 3, response.statusText)
                    }else{
                        this.router.navigate(['/components/credentials']).then(r => null)
                    }
                },
                error: (error) => {
                    this.showNotification('top', 'center', 3, error)
                    this.router.navigate(['/components/credentials']).then(r => null)
                }
        });
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
