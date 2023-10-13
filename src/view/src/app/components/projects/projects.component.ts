import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectService} from "../../services/project.service";
import {CProjectItem} from "../../class/CProjectItem";

declare interface DataTable {
    headerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-project',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

    dataRows: string[][] = [];
    projects: CProjectItem[];
    dataTable: DataTable;

    constructor(private projectService: ProjectService, private route: ActivatedRoute,
                private titleService: Title, private router: Router) {
        this.titleService.setTitle("Projects");
    }

    ngOnInit() {
        if (this.route.snapshot.data['project'].body['content'] != null) {
            this.projects = this.route.snapshot.data['project'].body['content'];
            for (let i = 0; i < this.projects.length; i++) {
                this.dataRows.push([this.projects[i].IdByTenant.toString(), this.projects[i].Name.toString(), this.projects[i].Description.toString(), this.projects[i].CreatedAt, this.projects[i].UpdatedAt]);
            }
        }

        this.dataTable = {
            headerRow: ['#', 'Project', 'Description', 'CreatedAt', 'UpdatedAt'],
            dataRows: this.dataRows
        }
    }

    add() {
        this.router.navigate(['/components/projects/create']).then(r => null);
    }
}
