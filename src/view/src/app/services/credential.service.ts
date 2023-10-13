import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Constants} from '../constants';

@Injectable({
    providedIn: 'root'
})
export class CredentialService {

    constructor(private http: HttpClient) {}

    add(credential) {
        const url = Constants.API_ENDPOINT + "/api/credentials";
        return this.http.post(url, JSON.stringify(credential), {observe: "response"});
    }

    update(credential, credentialId:number) {
        const url = Constants.API_ENDPOINT + "/api/credentials/"+credentialId;
        return this.http.patch(url, JSON.stringify(credential),{observe: "response"});
    }

    delete(credentialId:number) {
        const url = Constants.API_ENDPOINT + "/api/credentials/"+credentialId;
        return this.http.delete(url, {observe: "response"});
    }

}
