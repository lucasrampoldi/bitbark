import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Constants} from '../constants';

@Injectable({
    providedIn: 'root'
})
export class StackService {

    constructor(private http: HttpClient) {}

    get() {
        const url = Constants.API_ENDPOINT + "/api/stacks";
        return this.http.get(url, {observe: "response"});
    }

    add(stack) {
        const url = Constants.API_ENDPOINT + "/api/stacks";
        return this.http.post(url, JSON.stringify(stack), {observe: "response"});
    }

    update(stack, stackId:number) {
        const url = Constants.API_ENDPOINT + "/api/stacks/"+stackId;
        return this.http.patch(url, JSON.stringify(stack),{observe: "response"});
    }

    delete(stackId:number) {
        const url = Constants.API_ENDPOINT + "/api/stacks/"+stackId;
        return this.http.delete(url, {observe: "response"});
    }

}
