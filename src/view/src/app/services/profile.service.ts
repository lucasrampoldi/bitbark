import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Constants} from '../constants';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    constructor(private http: HttpClient) {}

    delete() {
        const url = Constants.API_ENDPOINT + "/api/profile";
        return this.http.delete(url, {observe: "response"});
    }

}
