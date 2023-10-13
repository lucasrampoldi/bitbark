import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from "@angular/router";
import Swal from "sweetalert2";
import {CStackItem} from "../../class/CStackItem";
import {StackService} from "../../services/stack.service";
import {CStackObjectAdd} from "../../class/CStackObjectAdd";
import {HttpResponse} from "@angular/common/http";

declare var swal: any;
declare var $: any;

interface FileReaderEventTarget extends EventTarget {
    result: string
}

interface FileReaderEvent extends Event {
    target: FileReaderEventTarget;

    getMessage(): string;
}

@Component({
    selector: 'app-stacks-detail',
    templateUrl: './stacks-detail.component.html',
    styleUrls: ['./stacks-detail.component.css']
})

export class StacksDetailComponent implements OnInit {
    stack: CStackItem = new CStackItem()
    myForm: FormGroup;

    constructor(private fb: FormBuilder, private route: ActivatedRoute, private stackService: StackService,
                private router: Router) {
        this.stack = this.route.snapshot.data['stack'].body['content'];
        this.myForm = this.fb.group({
            description: [this.stack.Description]
        });
    }

    ngOnInit() {
    }

    delete() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this! The stack will still be created.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.stackService
                    .delete(this.stack.IdByTenant)
                    .subscribe({
                        next: (response: HttpResponse<any>) => {
                            if (response.status != 200) {
                                this.showNotification('top', 'center', 3, response.statusText)
                            } else {
                                Swal.fire(
                                    'Deleted!',
                                    'Your stack is still created in the provider.',
                                    'success'
                                ).then(() => {
                                    this.router.navigate(['/components/stacks']).then(r => null);
                                })
                            }
                        },
                        error: (error) => {
                            this.showNotification('top', 'center', 3, error)
                            this.router.navigate(['/components/stacks']).then(r => null);
                        }
                    });

            }
        })
    }


    update(formGroup: FormGroup) {
        let stackObjectUpdate: CStackObjectAdd = new CStackObjectAdd;
        stackObjectUpdate.Description = formGroup.controls['description'].value;
        this.stackService
            .update(stackObjectUpdate, this.stack.IdByTenant)
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
                    this.router.navigate(['/components/stacks']).then(r => null)
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
