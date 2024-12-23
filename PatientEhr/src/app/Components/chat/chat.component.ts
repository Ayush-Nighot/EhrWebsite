import { Component, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, child, push } from 'firebase/database';
import { firebaseConfig } from '../../firebase-config';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../Services/User/user.service';
import { NotificationService } from '../../Services/notification.service';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})

export class ChatComponent {
  constructor(private activatedRoute: ActivatedRoute) {}
  userService = inject(UserService);

  receiverId: any;
  message: string = '';
  messages: any[] = [];
  senderName: any;
  receiverName: any;
  senderId=sessionStorage.getItem('userId')
  notificationService=inject(NotificationService);

  // Send message to receiver
  sendMessage(receiverId: string, message: string): void {
    console.log(receiverId + "" + message);
  
    const senderId = sessionStorage.getItem('userId'); // Get sender ID from session
  
    // Add message to the receiver's messages
    const messageRef = ref(db, 'messages/' + receiverId + senderId);
    const newMessageRef = push(messageRef);
    set(newMessageRef, {
      senderId: senderId, // Sender's ID
      message: message,
      timestamp: Date.now(),
    });
  
    // Add message to the sender's messages
    const senderMessageRef = ref(db, 'messages/' + senderId + receiverId);
    const senderNewMessageRef = push(senderMessageRef);
    set(senderNewMessageRef, {
      senderId: senderId, // Still sender's ID here
      message: message,
      timestamp: Date.now(),
    });
  
    this.message = ''; // Clear the input field
  }
  
  listenForMessages(receiverId: string): void {
    const messageRef = ref(db, 'messages/' + sessionStorage.getItem('userId') + receiverId);
    onValue(messageRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.messages = Object.values(data).sort((a: any, b: any) => a.timestamp - b.timestamp);
        const latestMessage = this.messages[this.messages.length - 1];

        // Check if the latest message is from another user
        if (latestMessage.senderId !== this.senderId) {
          // Send a notification
          this.notificationService.showNotification(
            'New Message from ' + latestMessage.senderId, 
            latestMessage.message
          );
          this.notificationService.setMessage(latestMessage.message); // Optional: You can show message inside the app too
        }
      }
    });
  }

  ngOnInit() {
    // Initialize listening to messages for a specific receiver
    this.receiverId = sessionStorage.getItem('receId');
    this.getSenderName();
    this.getReceiverName();
    this.listenForMessages(this.receiverId);
    console.log(this.senderId)
  }

  getSenderName() {
    this.userService.getUserById(Number(sessionStorage.getItem('userId'))).subscribe((res: any) => {
      this.senderName = res.data[0].firstName;
    });
  }

  getReceiverName() {
    this.userService.getUserById(Number(sessionStorage.getItem('receId'))).subscribe((res: any) => {
      this.receiverName = res.data[0].firstName;
    });
  }
} 
