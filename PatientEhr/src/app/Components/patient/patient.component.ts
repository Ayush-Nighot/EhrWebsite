import { Component, inject } from '@angular/core';
import { UserService } from '../../Services/User/user.service';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../Services/Appointment/appointment.service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderServiceService } from '../../Services/loader-service.service';
import { LoaderComponent } from "../loader/loader.component";

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoaderComponent],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})
export class PatientComponent {
  appointments: any[] = [];
  appointmentForm: FormGroup;
  loading = true;
  patientId: any = sessionStorage.getItem("userId"); // Get patient ID from user context or route
  userService = inject(UserService);
  provider: any;
  speciality: any;
  appointmentId: any;
  toast = inject(ToastrService);
  router = inject(Router);
  isUpdating: boolean = false;  // Flag to control visibility of the update form
  selectedAppointment: any = null;
  isModalOpen = false;
  loader=inject(LoaderServiceService)

  constructor(private appointmentService: AppointmentService, private fb: FormBuilder) {
    this.appointmentForm = this.fb.group({
      appointmentDate: ['', Validators.required],  // Date field (YYYY-MM-DD)
      appointmentTime: ['', Validators.required],  // Time field (HH:mm)
      chiefComplaint: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments() {
    this.appointmentService.getPatientAppointments(this.patientId).subscribe(
      (response: any) => {
        this.appointments = response.data;
        this.loading = false;
        this.fetchProviderDetailsForAppointments();
        console.log(this.appointments)
      },
      (error: any) => {
        console.error('Error loading appointments', error);
        this.loading = false;
      }
    );
  }

  fetchProviderDetailsForAppointments() {
    this.appointments.forEach(appointment => {
      this.userService.getUserById(appointment.providerId).subscribe(
        (response: any) => {
          this.userService.getSpecializationName(response.data[0].specializationId).subscribe((res: any) => {
            appointment.providerName = `${response.data[0].firstName + response.data[0].lastName}`;
            appointment.speciality = res.data.name;
          });
        },
        (error: any) => {
          console.error('Error loading provider details', error);
        }
      );
    });
  }

  cancelAppointment(appointmentId: number) {
    this.loader.show()
    this.appointmentService.cancelAppointment(appointmentId).subscribe(
      (response: any) => {
        this.loader.hide()
        this.toast.success('Appointment canceled successfully');
        this.loadAppointments();
      },
      (error: any) => {
        this.toast.show("Error Cancelling Appointment")
        this.loader.hide()
        console.error('Error canceling appointment', error);
      }
    );
  }

  openUpdateForm(appointment: any) {
    this.selectedAppointment = appointment;
    this.isUpdating = true;
  
    // Format the appointment date (only the date part, without time)
    const appointmentDate = new Date(appointment.appointmentDate);
    const formattedDate = this.formatDate(appointmentDate);  // Format only the date part
  
    // Format the appointment time (only the time part, ignoring the date part)
    const appointmentTime = new Date(appointment.appointmentTime);
    const formattedTime = this.formatTimeForInput(appointmentTime);  // Format only the time part
    this.isModalOpen = true;
    // Bind to form fields
    this.appointmentForm.patchValue({
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      chiefComplaint: appointment.chiefComplaint
    });
  }
  
  // Helper to format the date to "YYYY-MM-DD" (Standard format for date input)
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Pad months to 2 digits
    const day = date.getDate().toString().padStart(2, '0');          // Pad day to 2 digits
    return `${year}-${month}-${day}`;
  }
  
  // Helper to format the time to "HH:mm" (Standard format for time input)
  formatTimeForInput(time: Date): string {
    const hours = time.getHours().toString().padStart(2, '0');  // Pad hours to 2 digits
    const minutes = time.getMinutes().toString().padStart(2, '0');  // Pad minutes to 2 digits
    return `${hours}:${minutes}`;
  }
  
  closeModal() {
    this.isModalOpen = false;
  }

  openChatForAppointment(obj:any){
    sessionStorage.setItem('receId',obj)
    this.router.navigateByUrl('/chats')
  }
  
  updateAppointment() {
    this.loader.show()
    if (this.appointmentForm.valid) {
      const updatedAppointment = this.appointmentForm.value;
      const payload = {
        appointmentId: this.selectedAppointment.id,
        appointmentDate: `${updatedAppointment.appointmentDate}T10:15:24.255Z`,
        appointmentTime: `2025-02-05T${updatedAppointment.appointmentTime}`,
        chiefComplaint: updatedAppointment.chiefComplaint
      };
  
      console.log(payload)
      // Call the service to update the appointment
      this.appointmentService.updateAppointment(payload).subscribe(
        (response) => {
          this.toast.success('Appointment updated successfully.');
          this.isUpdating = false;  // Hide the update form
          this.loadAppointments();  // Reload the appointments list
          this.loader.hide()
          this.closeModal();
        },
        (error) => {
          console.error('Error updating appointment:', error);
          this.toast.error('Failed to update appointment.');
          this.loader.hide()
        }
      );
    }
  }
  
  cancelUpdate() {
    this.isUpdating = false;
    this.selectedAppointment = null;
  }
}
