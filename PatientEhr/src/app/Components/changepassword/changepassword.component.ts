import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../Services/User/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { LoaderServiceService } from '../../Services/loader-service.service';
import { LoaderComponent } from "../loader/loader.component";

@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoaderComponent],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css'
})
export class ChangepasswordComponent {
  passwordForm: FormGroup;
  email: string = sessionStorage.getItem('email') || '';
  toast = inject(ToastrService)
    loader=inject(LoaderServiceService)

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    // Initialize the form with validation
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$') // At least one upper case, one lower case, and one digit
        ]
      ],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    console.log(this.passwordForm);
  }

  passwordMatchValidator(group: FormGroup): any {
    const newPassword = group.get('newPassword')?.value;
    const cofirmPassword = group.get('confirmPassword')?.value;
  }

  changePassword() {
    this.loader.show()
    if (this.passwordForm.invalid) {
      this.toast.error('Please fix validation errors.');
      this.loader.hide()
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    const payload = {
      email: this.email,
      password: currentPassword,
      newPassword: newPassword,
    };

    console.log(payload)
    this.userService.changePassword(payload).subscribe({
      next: (response: any) => {
        console.log(response)
        if (response.status == 200) {
          console.log('Password changed successfully', response);
          this.toast.success('Password Changed Successfully')
          this.loader.hide()
        } else if (response.status === 400) {
          this.toast.error('Current Password is Wrong');
          this.loader.hide()

        }
      },
      error: (error) => {
        console.error('error changing password', error);
        this.toast.error('Error Changing Password')
        this.loader.hide()

      },
      
    });
  }
}
