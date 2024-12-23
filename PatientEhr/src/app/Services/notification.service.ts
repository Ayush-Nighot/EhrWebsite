import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageSource = new BehaviorSubject<string>('');
  currentMessage = this.messageSource.asObservable();

  constructor() {}

  // Function to show a browser notification
  showNotification(title: string, message: string): void {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: message,
        icon: 'assets/notification-icon.png' // Optional: Set an icon for the notification
      });
      console.log('message:', message);
      // Handle click on notification (e.g., open chat when clicked)
      notification.onclick = () => {
        window.focus(); // Focus the window if the user clicks the notification
      };
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log('message:', message);
          this.showNotification(title, message);
        }
      });
    }
  }

  // Function to set the current message
  setMessage(message: string): void {
    
    this.messageSource.next(message);
  }
}
