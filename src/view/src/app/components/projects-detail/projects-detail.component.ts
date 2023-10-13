import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2'
import {CProjectItem} from "../../class/CProjectItem";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ProjectService} from "../../services/project.service";
import {CProjectObjectAdd} from "../../class/CProjectObjectAdd";
import {HttpResponse} from "@angular/common/http";

declare var $: any;

@Component({
    selector: 'app-projects-detail',
    templateUrl: './projects-detail.component.html',
    styleUrls: ['./projects-detail.component.css']
})

export class ProjectsDetailComponent implements OnInit {
    project: CProjectItem = new CProjectItem()
    myForm: FormGroup;

    constructor(private fb: FormBuilder, private route: ActivatedRoute, private projectService: ProjectService, private router: Router) {
        this.project = this.route.snapshot.data['project'].body['content'];
        this.myForm = this.fb.group({
            description: [this.project.Description]
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
                this.projectService
                    .delete(this.project.IdByTenant)
                    .subscribe({
                            next: (response: HttpResponse<any>) => {
                                if (response.status != 200) {
                                    this.showNotification('top', 'center', 3, response.statusText)
                                } else {
                                    Swal.fire(
                                        'Deleted!',
                                        'Your project has been deleted.',
                                        'success'
                                    ).then(() => {
                                        this.router.navigate(['/components/projects']).then(r => null);
                                    })
                                }
                            },
                            error: (error) => {
                                this.showNotification('top', 'center', 3, error)
                                this.router.navigate(['/components/projects']).then(r => null);
                            }
                        });
            }
        })
    }

    update(formGroup: FormGroup) {
        let projectObjectUpdate: CProjectObjectAdd = new CProjectObjectAdd;
        projectObjectUpdate.Description = formGroup.controls['description'].value;
        this.projectService
            .update(projectObjectUpdate, this.project.IdByTenant)
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
