import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {StackService} from "../../services/stack.service";
import {CStackItem} from "../../class/CStackItem";
declare var $:any;

declare interface DataTable {
    headerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-stacks',
    templateUrl: './stacks.component.html',
    styleUrls: ['./stacks.component.css']
})

export class StacksComponent implements OnInit {

    dataRows: string[][] = [];
    stacks: CStackItem[] =[];
    dataTable: DataTable;

    constructor(private stackService: StackService, private route: ActivatedRoute,
                private titleService: Title, private router: Router) {
        this.titleService.setTitle("Stacks");
    }

    ngOnInit() {

        if (this.route.snapshot.data['stack'].body['content'] != null) {
            this.stacks = this.route.snapshot.data['stack'].body['content'];
            for (let i = 0; i < this.stacks.length; i++) {
                this.dataRows.push([this.stacks[i].IdByTenant.toString(), this.stacks[i].Name.toString(), this.stacks[i].Description.toString(), this.stacks[i].ProjectName.toString(),this.stacks[i].Status.toString(), this.stacks[i].CreatedAt, this.stacks[i].UpdatedAt]);
            }
        }

        this.dataTable = {
            headerRow: ['#', 'Stack', 'Description', 'Project', 'Status', 'CreatedAt', 'UpdatedAt'],
            dataRows: this.dataRows
        }
    }

    add() {
        this.router.navigate(['/components/stacks/create']).then(r => null);
    }

    refresh() {
        this.stackService
            .get()
            .subscribe(
                (stacks: any) => {
                for (let i = 0; i < stacks.length; i++) {
                    this.dataRows.push([this.stacks[i].IdByTenant.toString(), this.stacks[i].Name.toString(), this.stacks[i].Description.toString(), this.stacks[i].ProjectName.toString(), this.stacks[i].CreatedAt, this.stacks[i].UpdatedAt]);
                }
                this.dataTable = {
                    headerRow: ['#', 'Stack', 'Description',  'Project','Status', 'CreatedAt', 'UpdatedAt'],
                    dataRows: this.dataRows
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
