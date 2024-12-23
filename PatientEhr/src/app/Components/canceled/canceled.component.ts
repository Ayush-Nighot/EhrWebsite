  import { Component, inject } from '@angular/core';
  import { AppointmentService } from '../../Services/Appointment/appointment.service';
  import { UserService } from '../../Services/User/user.service';
  import { CommonModule } from '@angular/common';

  @Component({
    selector: 'app-canceled',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './canceled.component.html',
    styleUrls: ['./canceled.component.css']
  })
  export class CanceledComponent {
    appointment = inject(AppointmentService);
    userService = inject(UserService);
    id = sessionStorage.getItem('userId');
    app: any[] = [];
    ob:any[]=[];

    constructor() {
      this.getCanceledAppointment();
    }

    // Fetch canceled appointments
    getCanceledAppointment() {
      var iid=Number(this.id)
      this.appointment.getCanceledAppointment(iid).subscribe((res: any) => {
        this.app = res.data;
        console.log(this.app)
        this.app.forEach((appointment: any) => {
          this.loadPatientDetails(appointment.patientId, appointment);
        });
      });
    }

    // Fetch patient details and add them to the appointment
    loadPatientDetails(patientId: number, appointment: any): void {
      this.userService.getUserById(patientId).subscribe(
        (patientResponse: any) => {
          // Store patient details directly in the appointment object
          this.ob = patientResponse.data;
          console.log(this.ob)
        },
        (error: any) => {
          console.error('Error fetching patient details:', error);
        }
      );
    }
  }
