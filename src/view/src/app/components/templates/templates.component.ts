import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {CTemplateItem} from "../../class/CTemplateItem";
import {HttpClient} from "@angular/common/http";

declare interface DataTable {
    headerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-templates',
    templateUrl: './templates.component.html',
    styleUrls: ['./templates.component.css']
})

export class TemplatesComponent implements OnInit {
    templates: CTemplateItem[] = [];
    templateIndex: number = 0;
    constructor(private route: ActivatedRoute, private http: HttpClient,
                private titleService: Title) {
        this.titleService.setTitle("Templates");
        if (this.route.snapshot.data['template'].body['content'] != null) {
            this.templates = this.route.snapshot.data['template'].body['content'];
        }
    }

    ngOnInit() {
    }



}
