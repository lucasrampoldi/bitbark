import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from "@angular/router";
import Swal from "sweetalert2";
import {CCredentialItem} from "../../class/CCredentialItem";
import {CredentialService} from "../../services/credential.service";
import {CCredentialObjectAdd} from "../../class/CCredentialObjectAdd";
import {HttpResponse} from "@angular/common/http";

declare var $: any;

interface FileReaderEventTarget extends EventTarget {
    result: string
}

@Component({
    selector: 'app-credentials-detail',
    templateUrl: './credentials-detail.component.html',
    styleUrls: ['./credentials-detail.component.css']
})

export class CredentialsDetailComponent implements OnInit {
    credential: CCredentialItem = new CCredentialItem()
    myForm: FormGroup;

    constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private credentialService: CredentialService) {
        this.credential = this.route.snapshot.data['credential'].body['content']
        this.myForm = this.fb.group({
            description: [this.credential.Description]
        });
    }

    ngOnInit() {
    }

    delete() {
        //here you can do something, sent the form to server via ajax and show a success message with swal
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.credentialService.delete(this.credential.IdByTenant)
                    .subscribe({
                            next: (response: HttpResponse<any>) => {
                                if (response.status != 200) {
                                    this.showNotification('top', 'center', 3, response.statusText)
                                } else {
                                    Swal.fire(
                                        'Deleted!',
                                        'Your credential has been deleted.',
                                        'success'
                                    ).then(() => {
                                        this.router.navigate(['/components/credentials']).then(r => null);
                                    })
                                }
                            },
                            error: (error) => {
                                this.showNotification('top', 'center', 3, error)
                                this.router.navigate(['/components/credentials']).then(r => null);

                            }
                        }
                    );
            }
        })
    }


    update(formGroup: FormGroup) {
        let credentialObjectUpdate: CCredentialObjectAdd = new CCredentialObjectAdd;
       credentialObjectUpdate.Description = formGroup.controls['description'].value;
        this.credentialService
            .update(credentialObjectUpdate, this.credential.IdByTenant)
            .subscribe({
                next: (response: HttpResponse<any>) => {
                    if (response.status != 200) {
                        this.showNotification('top', 'center', 3, response.statusText)
                    }else{
                        this.showNotification('top', 'center', 1, "Updated")
                    }
                },
                error: (error) => {
                    this.showNotification('top', 'center', 3, error)
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
