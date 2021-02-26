import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private url = 'http://localhost:44377';
  constructor(private httpClient: HttpClient) { }

  login(userName: string): Observable<void> {
    return this.httpClient.post<void>(this.url + '/api/hubs/authorization/login', userName);
  }
}
