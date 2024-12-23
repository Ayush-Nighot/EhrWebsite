import { Component, ElementRef, inject, ViewChild, AfterViewInit } from '@angular/core';
import { AppointmentService } from '../../Services/Appointment/appointment.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../Services/User/user.service';
import { CommonModule } from '@angular/common';
import { loadStripe, StripeElements, StripeCardElement, Stripe } from '@stripe/stripe-js';
import { ToastrService } from 'ngx-toastr';
import { LoaderServiceService } from '../../Services/loader-service.service';
import { LoaderComponent } from "../loader/loader.component";

@Component({
  selector: 'app-add-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoaderComponent],
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.css']
})
export class AddAppointmentComponent  {
  userService = inject(UserService);
  stripe: Stripe | null = null; // Stripe.js instance
  elements: StripeElements | null = null; // Stripe Elements instance
  cardElement: StripeCardElement | null = null; // Stripe Card Element
  appointmentForm: FormGroup;
  paymentError: string | null = null; 
  specialties: any[] = [];
  providers: any[] = [];
  minDate = new Date();
  
  
  patientId: any = sessionStorage.getItem('userId');

  // These two properties will track success or error messages
  appointmentScheduled: boolean = false;
  errorOccurred: boolean = false;
  fees: any;
  toast=inject(ToastrService)
  loader=inject(LoaderServiceService)

  @ViewChild('card') card: ElementRef | undefined;

  constructor(
    private appointmentService: AppointmentService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.appointmentForm = this.fb.group({
      speciality: ['', Validators.required],
      providerId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required,this.validateTime.bind(this)],
      chiefComplaint: ['', Validators.required],
      fee: ['']
    });
  }

  validateTime(control: any): { [key: string]: boolean } | null {
    const selectedDate = this.appointmentForm.get('appointmentDate')?.value;
    const selectedTime = control.value;
  
    if (!selectedDate || !selectedTime) {
      return null; // No error if either field is empty
    }
  
    const today = new Date();
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
  
    if (new Date(selectedDate).toDateString() === today.toDateString()) {
      const oneHourFromNow = new Date(today.getTime() + 60 * 60 * 1000);
      if (selectedDateTime <= oneHourFromNow) {
        return { invalidTime: true }; // Validation failed
      }
    }
  
    return null; // Validation succeeded
  }
  

  async ngOnInit() {
    this.loadSpecialties();
    try {
      console.log('Loading Stripe...');
      this.stripe = await loadStripe('pk_test_51QXF8WArTiHSfmyLrInQy7rjJnQ4rtrF6yivK2wDtM0AdtosNdOALQ1wkLq8AidJ5Xt6qjfsz1xLy7OyoxGD6CHP0014AhP0LZ'); // Ensure your key is correct
      console.log("stripe", this.stripe);
  
      if (!this.stripe) {
        throw new Error('Stripe failed to load');
      }
      console.log('Stripe loaded:', this.stripe);
  
      console.log('Initializing Stripe Elements...');
      this.elements = this.stripe.elements();
  
      if (!this.elements) {
        throw new Error('Stripe Elements failed to initialize');
      }
  
      console.log('Stripe Elements initialized:', this.elements);
  
      // After elements are initialized, create and mount the card element
      this.mountCardElement();
  
    } catch (error) {
      console.error('Stripe initialization error:', error);
      this.paymentError = 'Failed to initialize Stripe elements. Please try again later.';
    }
  }
  
  // Mount the card element only after Stripe Elements are ready
  mountCardElement() {
    if (this.elements && this.card && !this.cardElement) {
      // Create and mount the card element
      this.cardElement = this.elements.create('card');
      this.cardElement.mount(this.card.nativeElement);  // Mount to the div with id 'card'
      console.log('Card element mounted successfully.');
    } else {
      console.error('Stripe elements or card element is not initialized.');
      this.paymentError = 'Failed to initialize Stripe elements.';
    }
  }
  
  

  loadSpecialties() {
    // Call an API to fetch specialties (this can be a static list or fetched dynamically)
    this.userService.getSpecializations().subscribe((res: any) => {
      if (res.status == 200) {
        this.specialties = res.data;
        console.log(this.specialties);
      }
    });
  }

  onSpecialityChange(event: Event): void {
    const target = event.target as HTMLSelectElement; // Explicitly type the target as HTMLSelectElement
    const specialityId = Number(target.value);

    if (specialityId) {
      this.appointmentService.getProvidersBySpeciality(specialityId).subscribe(
        (response: any) => {
          this.providers = response.data;
          console.log(this.providers)
        },
        (error: any) => {
          console.error('Error fetching providers', error);
        }
      );
    }
  }

  onProviderChange(event: any): void {
    const providerId = event.target.value; // Get the selected provider ID
    this.userService.getVisitingFee(providerId).subscribe((res: any) => {
      // Assuming the response contains the fee value
      this.fees = res; // Assuming the fee is inside res.data.fee
    })
  }

  

  onSubmit(): void {
    this.loader.show()
    if (this.appointmentForm.invalid) {
      this.toast.warning("Please Enter Valid Fields")
      this.loader.hide()
      return;
    }
  
    const appointmentData = this.appointmentForm.value;
  
    // Format the appointmentDate and appointmentTime
    const date = new Date(appointmentData.appointmentDate);
    const timeParts = appointmentData.appointmentTime.split(":");
    date.setHours(Number(timeParts[0]));
    date.setMinutes(Number(timeParts[1]));
    appointmentData.appointmentDate = date.toISOString();
    appointmentData.appointmentTime = `2024-12-29T${appointmentData.appointmentTime}:00.0000000`;
    appointmentData.providerId = Number(appointmentData.providerId);
    appointmentData.patientId = Number(this.patientId);
  
    // Ensure fee is set
    if (!this.fees) {
      console.error('Fee is not available');
      this.loader.hide()
      return;
    }
    appointmentData.fee = Number(this.fees);
  
    console.log('Appointment Data:', appointmentData);
  
    const Obj = { amount: appointmentData.fee };
  
    // Step 1: Call the backend to create a payment intent
    this.appointmentService.createPaymentIntent(Obj).subscribe({
      next: async (response) => {
        const clientSecret = response.clientSecret;
        if (this.stripe && this.cardElement) {
          try {
            // Step 2: Confirm the payment with the Stripe.js confirmCardPayment method
            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  name: appointmentData.patientName, // Use actual patient name here
                },
              },
            });
  
            // Step 3: Handle payment result
            if (error) {
              this.paymentError = error?.message ?? 'An unknown error occurred.';

              console.error('Payment failed:', error);
              this.toast.show('Payment failed: ' + error.message);
              return;
            }
  
            // If payment succeeded
            if (paymentIntent.status === 'succeeded') {
              console.log(appointmentData);
              this.appointmentService.addAppointment(appointmentData).subscribe(
                (response: any) => {
                  this.toast.success('Appointment scheduled successfully');
                  this.appointmentScheduled =   true;
                  this.errorOccurred = false;
                  this.loader.hide()
                  // alert('Appointment scheduled successfully!');
                  this.router.navigateByUrl("/patient")
                },
                (error) => {
                  this.toast.show('Error scheduling appointment:', error);
                  this.appointmentScheduled = false;
                  this.errorOccurred = true;
                  this.loader.hide()
                  alert('There was an error scheduling your appointment.');
                }
              );
            } else {
              console.error('Unexpected payment intent status:', paymentIntent.status);
              this.toast.show('Payment was not successful.');
              this.loader.hide()
            }
          } catch (error) {
            this.toast.show('Error during payment confirmation');
            this.paymentError = 'An error occurred while confirming payment.';
            this.loader.hide()
          }
        } else {
          console.error('Stripe or CardElement is not initialized');
          alert('Payment method is not available.');
          this.loader.hide()
        }
      },
      error: (err) => {
        this.toast.show("Error Creating Payment Intent: Stripe Error")
        console.error('Error creating payment intent:', err);
        this.paymentError = 'An error occurred while creating the payment intent.';
        this.loader.hide()
      },
    });
  }
}
