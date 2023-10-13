import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CProjectObjectAdd} from '../../class/CProjectObjectAdd';
import {ProjectService} from "../../services/project.service";
import {Title} from "@angular/platform-browser";
import {HttpResponse} from "@angular/common/http";

declare var $: any;

@Component({
    selector: 'app-projects-create',
    templateUrl: './projects-create.component.html',
    styleUrls: ['./projects-create.component.css']
})
export class ProjectsCreateComponent implements OnInit {
    myForm: FormGroup;

    constructor(private fb: FormBuilder, private projectService: ProjectService,
                private titleService: Title, private router: Router) {
        this.myForm = this.fb.group({
            name: ['', [Validators.required]],
            description: ['', [Validators.required]]
        });
        this.titleService.setTitle("Create project");
    }

    ngOnInit() {
    }

    createProject(formGroup: FormGroup) {
        let projectObjectAdd: CProjectObjectAdd = new CProjectObjectAdd;
        projectObjectAdd.Name = formGroup.controls['name'].value;
        projectObjectAdd.Description = formGroup.controls['description'].value;
        this.projectService
            .add(projectObjectAdd)
            .subscribe({
                    next: (response: HttpResponse<any>) => {
                        if (response.status != 200) {
                            this.showNotification('top', 'center', 3, response.statusText)
                        } else {
                            this.router.navigate(['/components/projects']).then(r => null)
                        }
                    },
                    error: (error) => {
                        this.showNotification('top', 'center', 3, error)
                        this.router.navigate(['/components/projects']).then(r => null)
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
