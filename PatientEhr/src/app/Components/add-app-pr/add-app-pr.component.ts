import { Component, ElementRef, inject, ViewChild, AfterViewInit } from '@angular/core';
import { AppointmentService } from '../../Services/Appointment/appointment.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../Services/User/user.service';
import { CommonModule } from '@angular/common';
import { SharedServiceService } from '../../Services/shared-service.service';
import { LoaderServiceService } from '../../Services/loader-service.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderComponent } from '../loader/loader.component';
@Component({
  selector: 'app-add-app-pr',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,LoaderComponent],
  templateUrl: './add-app-pr.component.html',
  styleUrl: './add-app-pr.component.css'
})
export class AddAppPrComponent {
  userService = inject(UserService);
  appointmentService = inject(AppointmentService);
  loader = inject(LoaderServiceService);
  toast = inject(ToastrService);
  sharedService = inject(SharedServiceService);

  appointmentForm: FormGroup;
  providerDetails: any = {};
  patientId = sessionStorage.getItem('patId');
  providerId = sessionStorage.getItem('userId');

  minDate = new Date();
  appointmentScheduled: boolean = false;
  errorOccurred: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.appointmentForm = this.fb.group({
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      chiefComplaint: ['', Validators.required],
      providerId: [this.providerId, Validators.required], // providerId will be auto-filled
      fee: [''] // Will be mapped from the provider details
    });
   
  }

  ngOnInit(): void {
    if (this.providerId) {
      this.loadProviderDetails();
    } else {
      this.toast.warning("Provider ID not found.");
    }
  }

  loadProviderDetails(): void {
    this.userService.getUserById(this.providerId).subscribe((res: any) => {
      if (res.status == 200) {
        this.providerDetails = res.data[0];
        console.log(this.providerDetails)
        // Auto-filling the form with provider data
        this.appointmentForm.patchValue({
          fee: this.providerDetails.visitingCharge
        });
      } else {
        this.toast.error("Error fetching provider details.");
      }
    }, (error) => {
      console.error("Error fetching provider details", error);
      this.toast.error("Error fetching provider details.");
    });
  }

  onSubmit(): void {
    this.loader.show();
    if (this.appointmentForm.invalid) {
      console.log('Form validation errors:', this.appointmentForm.errors);
      this.toast.warning("Invalid Input");
      this.loader.hide();
      return;
    }

    const appointmentData = this.appointmentForm.value;

    // Format the appointmentDate and appointmentTime
    const date = new Date(appointmentData.appointmentDate);
    const timeParts = appointmentData.appointmentTime;
    date.setHours(Number(timeParts[0]));
    date.setMinutes(Number(timeParts[1]));
    appointmentData.appointmentDate = date.toISOString();
    appointmentData.appointmentTime=`2024-12-29T${appointmentData.appointmentTime}:00.0000000`
    // appointmentData.appointmentTime=
    appointmentData.patientId = Number(this.patientId);
    appointmentData.providerId = Number(appointmentData.providerId);
    // Ensure fee is set
    if (!appointmentData.fee) {
      console.error('Fee is not available');
      this.toast.warning('Fee is not available');
      this.loader.hide();
      return;
    }

    console.log('Appointment Data:', appointmentData);
    // Call the backend to schedule the appointment directly
    this.appointmentService.addAppointment(appointmentData).subscribe(
      (response: any) => {
        console.log('Appointment scheduled successfully:', response);
        this.loader.hide();
        this.appointmentScheduled = true;
        this.errorOccurred = false;
        this.toast.success('Appointment scheduled successfully!');
        this.router.navigateByUrl("/provider");
      },
      (error) => {
        console.error('Error scheduling appointment:', error);
        this.appointmentScheduled = false;
        this.errorOccurred = true;
        this.toast.show('There was an error scheduling your appointment.');
        this.loader.hide();
      }
    );
  }
}
