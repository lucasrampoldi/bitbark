import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Constants} from '../constants';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {

    constructor(private http: HttpClient) {}

    add(project) {
        const url = Constants.API_ENDPOINT + "/api/projects";
        return this.http.post(url, JSON.stringify(project), {observe: "response"});
    }

    update(project, projectId:number) {
        const url = Constants.API_ENDPOINT + "/api/projects/"+projectId;
        return this.http.patch(url, JSON.stringify(project),{observe: "response"});
    }

    delete(projectId:number) {
        const url = Constants.API_ENDPOINT + "/api/projects/"+projectId;
        return this.http.delete(url, {observe: "response"});
    }

    getCredentials(projectId:number ) {
        const url = Constants.API_ENDPOINT + "/api/projects/"+projectId+"/credentials";
        return this.http.get(url, {observe: "response"});
    }

}




