import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../Services/User/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { LoaderServiceService } from '../../Services/loader-service.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterLink,LoaderComponent],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {
  forgotPasswordForm: FormGroup;
  loader=inject(LoaderServiceService)
  toast = inject(ToastrService)

  constructor(
    private userService: UserService,
    private router: Router
  ) {
      this.forgotPasswordForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email])
      });
  }
  onSubmit(): void {
    // Show loader when request starts
    this.loader.show();
  
    // Check if the form is invalid
    if (this.forgotPasswordForm.invalid) {
      this.toast.warning('Invalid email address.', 'Warning', {
        timeOut: 3000,
        closeButton: true
      });
  
      // Hide the loader as the form is invalid
      this.loader.hide();
      return;
    }
  
    const email = this.forgotPasswordForm.value.email;
  
    // Make the API call to reset the password
    this.userService.forgetPassword(email).subscribe(
      (response: any) => {
        // On successful response
        console.log(response);
  
        if (response.status === 200) {
          this.toast.success('Password reset instructions sent to your email.', 'Success', {
            timeOut: 3000,
            closeButton: true
          });
  
          // Navigate to login page after success
          this.router.navigateByUrl('/login');
        } else {
          // If the response is not successful (status is not 200)
          this.toast.error('Something went wrong. Please try again later.', 'Error', {
            timeOut: 3000,
            closeButton: true
          });
        }
  
        // Hide the loader after handling the response
        this.loader.hide();
      },
      (error) => {
        // On error (API call fails)
        console.error('Error:', error);
  
        // Handle specific error cases (optional)
        if (error.status === 400) {
          this.toast.error('Invalid email format or missing information.', 'Error', {
            timeOut: 3000,
            closeButton: true
          });
        } else if (error.status === 500) {
          this.toast.error('Server error. Please try again later.', 'Error', {
            timeOut: 3000,
            closeButton: true
          });
        } else {
          this.toast.warning('Wrong Email.', 'Error', {
            timeOut: 3000,
            closeButton: true
          });
        }
  
        // Hide the loader if there's an error
        this.loader.hide();
      }
    );
  }
  
}
