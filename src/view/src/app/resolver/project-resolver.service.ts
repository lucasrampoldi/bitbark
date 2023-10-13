import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {Constants} from "../constants";

@Injectable()
export class ProjectResolver implements Resolve<any> {

    constructor(private http: HttpClient) {}

    resolve(): Observable<any> {
        const url = Constants.API_ENDPOINT + "/api/projects";
        return this.http.get(url, {observe: "response"});
    }
}
