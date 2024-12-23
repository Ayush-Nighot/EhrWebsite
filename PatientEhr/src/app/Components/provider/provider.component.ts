import { Component, inject } from '@angular/core';
import { UserService } from '../../Services/User/user.service';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../Services/Appointment/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { SoapNoteService } from '../../Services/soap-note.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedServiceService } from '../../Services/shared-service.service';
import { LoaderComponent } from '../loader/loader.component';
import { LoaderServiceService } from '../../Services/loader-service.service';
import { initializeApp } from "firebase/app";
import { getMessaging,getToken } from "firebase/messaging";


@Component({
  selector: 'app-provider',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,LoaderComponent],
  templateUrl: './provider.component.html',
  styleUrl: './provider.component.css'
})
export class ProviderComponent {
  userService = inject(UserService);
  appointmentService = inject(AppointmentService);
  toast = inject(ToastrService);
  router = inject(Router);
  soapService = inject(SoapNoteService);
  sharedService = inject(SharedServiceService);
  loader=inject(LoaderServiceService)

  // State variables for forms visibility
  showUpdateForm: boolean = false;
  showSoapForm: boolean = false;
  maxDate: string = '';

  // Appointment and patient data
  providerId = sessionStorage.getItem('userId');
  appointments: any[] = [];
  patients: any[] = [];
  patData: any[] = [];
  minTime: string = '';

  // SOAP form data
  soapData = {
    appointmentId: 0,
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  };

  // Update form data
  updateData = {
    appointmentId: 0,
    appointmentDate: '',
    appointmentTime: '',
    chiefComplaint: '',
  };

  currentAppointmentId: number | null = null;

  ngOnInit(): void {
    this.getPatients();
    this.loadAppointments();
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const yyyy = today.getFullYear();
    this.maxDate = `${yyyy}-${mm}-${dd}`;
    this.setMinTime();
  }

  openChatForAppointment(obj:any){
    sessionStorage.setItem('receId',obj)
    this.router.navigateByUrl('/chats')
  }

  

  setMinTime() {
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 60); // Add 1 hour (60 minutes)

    // Get the hours and minutes from the updated currentDate
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    // Construct the minimum time in HH:MM format
    this.minTime = `${hours}:${minutes}`;
  }

  // Load appointments for the provider
  loadAppointments(): void {
    const id = Number(this.providerId);
    this.appointmentService.getAppointmentByProvider(id).subscribe((response: any) => {
      this.appointments = response.data;
      console.log(this.appointments)
      this.appointments.forEach((appointment: any) => {
        this.loadPatientDetails(appointment.patientId, appointment); // Fetch patient details for each appointment
      });
    }, (error: any) => {
      console.error('Error fetching appointments:', error);
    });
  }

  // Fetch patient details for each appointment
  loadPatientDetails(patientId: number, appointment: any): void {
    this.userService.getUserById(patientId).subscribe((patientResponse: any) => {
      appointment.patient = patientResponse.data[0];
    }, (error: any) => {
      console.error('Error fetching patient details:', error);
    });
  }

  // Get the list of patients
  getPatients(): void {
    this.userService.getAllUser().subscribe((res: any) => {
      this.patients = res.data;
    });
  }

  // Show SOAP form when appointment is marked "Complete"
  showSoapFormForCompletion(appointmentId: number): void {
    this.currentAppointmentId = appointmentId;
    this.showSoapForm = true;
    this.soapData.appointmentId = appointmentId;
  }

  // Submit SOAP form
  submitSoapForm(): void {
    this.loader.show()
    if (this.soapData.subjective && this.soapData.objective && this.soapData.assessment && this.soapData.plan) {
      this.soapService.addSoap(this.soapData).subscribe((response: any) => {
        // this.toast.success('SOAP Notes added successfully');
        this.completeAppointment(this.soapData.appointmentId);
        this.loader.hide()
      });
    } else {
      this.toast.warning('Please fill in all fields');
      this.loader.hide()
    }
  }

  // Complete the appointment
  completeAppointment(appointmentId: number): void {
    this.loader.show()
    this.appointmentService.completeAppointment(appointmentId).subscribe((res: any) => {
      if (res.status == 200) {
        this.toast.success('Appointment Completed');
        this.showSoapForm = false;
        this.loader.hide()
        this.loadAppointments(); // Reload appointments list after completion
      } else {
        this.toast.show(res.message);
        this.loader.hide()
      }
    });
  }

  // Cancel an appointment
  cancelAppointment(appointmentId: number): void {
    this.loader.show()
    this.appointmentService.cancelAppointment(appointmentId).subscribe((res: any) => {
      if (res.status == 200) {
        this.toast.success('Appointment Canceled Successfully');
        this.loader.hide()
        this.loadAppointments(); // Reload appointments after cancellation
      } else {
        this.toast.show(res.message);
        this.loader.hide()
      }
    });
  }

  showUpdateFormForAppointment(appointment: any): void {
    this.showUpdateForm = true;  // Show the update form
  
    // Extract the date and time from the backend data
    const appointmentDate = new Date(appointment.appointmentDate);  // Assuming appointmentDate is in DateTime format
    const appointmentTime = new Date(appointment.appointmentTime);  // Assuming appointmentTime is in DateTime format
  
    // Manually extract the date part as 'YYYY-MM-DD'
    const formattedDate = this.formatDate(appointmentDate);
  
    // Manually extract the time part as 'HH:mm'
    const formattedTime = this.formatTime(appointmentTime);
  
    // Assign the formatted values to updateData
    this.updateData = {
      appointmentId: appointment.id,
      appointmentDate: formattedDate,  // Date formatted as 'YYYY-MM-DD'
      appointmentTime: formattedTime,  // Time formatted as 'HH:mm'
      chiefComplaint: appointment.chiefComplaint
    };
  
    console.log(this.updateData);  // Log the updated data to check if it's correctly formatted
  }
  
  // Helper function to format date as 'YYYY-MM-DD'
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Helper function to format time as 'HH:mm'
  formatTime(time: Date): string {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  

  // This function is triggered to cancel the update form (when you click "Cancel")
  cancelUpdate(): void {
    this.showUpdateForm = false;  // Hide the update form
  }

  // Submit the updated appointment details
  submitUpdateForm(): void {
    this.loader.show()
    if (this.updateData.appointmentDate && this.updateData.appointmentTime && this.updateData.chiefComplaint) {

      console.log(this.updateData)
      this.updateData.appointmentDate=`${this.updateData.appointmentDate}T10:15:24.255Z`
      this.updateData.appointmentTime=`2025-02-05T${this.updateData.appointmentTime}:08.700Z`

      this.appointmentService.updateAppointment(this.updateData).subscribe(
        (response: any) => {
          this.toast.success('Appointment Updated Successfully');
          this.showUpdateForm = false;  // Hide the update form after submission
          this.loadAppointments(); // Reload appointments list
          this.loader.hide()
        },
        (error: any) => {
          console.error('Error updating appointment:', error);
          this.toast.error('Error updating appointment');
          this.loader.hide()
        }
      );
    } else {
      this.toast.warning('Please fill in all fields');
      this.loader.hide()
    }
  }

  // Navigate to appointment page
  addAppointment(patientId: any): void {
    this.sharedService.setData(patientId);
    sessionStorage.setItem('patId',patientId)
    this.router.navigateByUrl('/appointmentpr');
  }
}
