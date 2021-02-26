import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as signalR from '@aspnet/signalr';
import { AuthorizationService } from '../services/authorization.service';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})
export class AuthorizationComponent implements OnInit {
  authenticatedUsers: { id: number, username: string }[];
  isLogined: boolean = false;
  constructor() {
    this.authenticatedUsers = [];
  }
  private hubConnection: signalR.HubConnection;
  currentUserName: string;

  userForm: FormGroup;

  private initializeForm() {
    this.userForm = new FormGroup({
      userName: new FormControl(this.currentUserName, Validators.required)
    })
  }

  get getName(): string {
    return this.userForm.controls.userName.value;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:44377/api/hubs/authorization").build()
    this.hubConnection.start().then(() => {
      console.log("Connection started");
    }).catch(err => console.log(err));

    this.hubConnection.onclose(() => {
      setTimeout(() => {
        this.hubConnection.start().then(() => {
          console.log("Connection started");
        }).catch(err => console.log(err));
      }, 5000);
    });
    this.registerSignalREvents();
  }

  stopConnection() {
    this.hubConnection.start().then(() => {
      console.log("stopped");
    }).catch(err => console.log(err));
  }

  onSubmit(): void {
    this.hubConnection.invoke('Login', this.getName).catch(err => console.log(err));
    this.isLogined = true;
    this.authenticatedUsers.length ?
      this.authenticatedUsers.push(
        {
          id: this.authenticatedUsers[this.authenticatedUsers.length-1].id + 1,
          username: this.getName
        }) : this.authenticatedUsers.push({ id: 1, username: this.getName })
  }

  private registerSignalREvents(): void {
    this.hubConnection.on('UserLogined', (id, name) => {
      this.newUserLogined(id, name);
    });
    this.hubConnection.on('UserLogout', (id) => {
      const user = this.authenticatedUsers.find(s => s.id === id);
      this.authenticatedUsers.splice(this.authenticatedUsers.indexOf(user), 1);
    });
  }

  logout(): void {
    const user = this.authenticatedUsers.find(s => s.username === this.getName);
    this.hubConnection.invoke('Logout', user.id).catch(err => console.log(err));
    this.authenticatedUsers.splice(this.authenticatedUsers.indexOf(user), 1);
    this.isLogined = false;
  }

  newUserLogined(id: number, username: string) {
    this.authenticatedUsers.push({ id, username })
  }

}
