import { Component, OnInit } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {
  bannerMessage: string;
  editMode: boolean = false;
  hubConnection: signalR.HubConnection;


  constructor() { }

  ngOnInit(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:44377/api/hubs/banner").build()
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

  private registerSignalREvents(): void {
    this.hubConnection.on('BannerMessageChanges', (message: string) => {
      this.bannerMessage = message;
    });
    
  }

  editMessage(): void {
    this.editMode = !this.editMode;
  }

  save(): void {
    this.hubConnection.invoke('MessageChange',this.bannerMessage);
    this.editMode = false;
  }

}
