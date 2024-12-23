import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderServiceService } from './Services/loader-service.service';
import { NotificationService } from './Services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'PatientEhr';
  loaderService=inject(LoaderServiceService)
  isLoading$ = this.loaderService.loading$;
  notificationMessage: string = '';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Subscribe to notification messages
    this.notificationService.currentMessage.subscribe(message => {
      this.notificationMessage = message;
      if (this.notificationMessage) {
        // Show the in-app notification or handle UI logic
        console.log('New message received:', this.notificationMessage);
      }
    });
  }
}
