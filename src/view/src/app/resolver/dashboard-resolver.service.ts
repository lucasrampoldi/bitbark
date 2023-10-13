import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {Constants} from "../constants";

@Injectable()
export class DashboardResolver implements Resolve<any> {

    constructor(private http: HttpClient) {
    }

    resolve(): Observable<any> {
        const url = Constants.API_ENDPOINT + "/api/dashboards";
        return this.http.get(url, {observe: "response"});
    }
}
