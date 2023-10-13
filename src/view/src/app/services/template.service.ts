import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Constants} from '../constants';

@Injectable({
    providedIn: 'root'
})
export class TemplateService {

    constructor(private http: HttpClient) {
    }

    get() {
        const url = Constants.API_ENDPOINT + "/api/templates";
        return this.http.get(url, {observe: "response"});
    }

}
