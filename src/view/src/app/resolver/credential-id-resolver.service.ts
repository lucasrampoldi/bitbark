import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {Constants} from "../constants";

@Injectable()
export class CredentialIdResolver implements Resolve<any> {

    constructor(private http: HttpClient) {}

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const id = route.paramMap.get('id');
        const url = Constants.API_ENDPOINT + "/api/credentials/"+id;
        return this.http.get(url, {observe: "response"});
    }
}
