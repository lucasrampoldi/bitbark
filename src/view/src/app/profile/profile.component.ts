import {Component, OnInit} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {AuthService} from '@auth0/auth0-angular';
import Swal from "sweetalert2";
import {HttpResponse} from "@angular/common/http";
import {ProfileService} from "../services/profile.service";
import {Router} from "@angular/router";
import {Constants} from "../constants";

declare var $: any;

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
    myForm: FormGroup;
    user$ = this.auth.user$;
    authService: AuthService
    constructor(public auth: AuthService, private profileService: ProfileService, private router: Router) {
        this.authService = auth
    }

    ngOnInit() {
    }

    delete() {
        //here you can do something, sent the form to server via ajax and show a success message with swal
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this! All data will be removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.profileService.delete()
                    .subscribe({
                            next: (response: HttpResponse<any>) => {
                                if (response.status != 200) {
                                    this.showNotification('top', 'center', 3, response.statusText)
                                } else {
                                    Swal.fire(
                                        'Deleted!',
                                        'Your user has been deleted.',
                                        'success'
                                    ).then(() => {
                                        this.authService.logout({ logoutParams: { returnTo:`${Constants.APP_ENDPOINT}/` }})
                                    })
                                }
                            },
                            error: (error) => {
                                this.showNotification('top', 'center', 3, error)
                                this.router.navigate(['/profile']).then(r => null);

                            }
                        }
                    );
            }
        })
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
