import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {CCredentialItem} from "../../class/CCredentialItem";

declare interface DataTable {
    headerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-credentials',
    templateUrl: './credentials.component.html',
    styleUrls: ['./credentials.component.css']
})

export class CredentialsComponent implements OnInit {

    dataRows: string[][] = [];
    credentials: CCredentialItem[] = [];
    dataTable: DataTable;

    constructor(private route: ActivatedRoute,
                private titleService: Title, private router: Router) {
        this.titleService.setTitle("Credentials");
    }

    ngOnInit() {
        if (this.route.snapshot.data['credential'].body['content'] != null) {
            this.credentials = this.route.snapshot.data['credential'].body['content'];
            for (let i = 0; i < this.credentials.length; i++) {
                this.dataRows.push([this.credentials[i].IdByTenant.toString(), this.credentials[i].Name.toString(), this.credentials[i].Description.toString(),this.credentials[i].Provider.toString(), this.credentials[i].Account.toString(),this.credentials[i].AccessKeyMask.toString(),this.credentials[i].ProjectName,this.credentials[i].CreatedAt, this.credentials[i].UpdatedAt]);
            }
        }

        this.dataTable = {
            headerRow: ['#', 'Name', 'Description', 'Provider', 'Account', 'Access Key','Project', 'CreatedAt', 'UpdatedAt'],
            dataRows: this.dataRows
        }
    }

    add() {
        this.router.navigate(['/components/credentials/create']).then(r => null);
    }
}
