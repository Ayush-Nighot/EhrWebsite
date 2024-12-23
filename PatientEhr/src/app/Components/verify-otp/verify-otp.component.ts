import { Component, inject } from '@angular/core';
import { UserService } from '../../Services/User/user.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { LoaderServiceService } from '../../Services/loader-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,LoaderComponent],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css'
})
export class VerifyOtpComponent {
  userService = inject(UserService)
  toaster = inject(ToastrService)
  router = inject(Router)
  loader=inject(LoaderServiceService)
  role=sessionStorage.getItem('id')
  // loaderService=inject(LoaderServiceService)
  userEmail = sessionStorage.getItem('email')
    otpForm: FormGroup = new FormGroup({
    email: new FormControl(this.userEmail, [Validators.required, Validators.email]),
    otp: new FormControl('', [Validators.required])
  })

  formValue: any;
  onSubmit(): void {
    this.loader.show()
    this.formValue = this.otpForm.value;
    this.userService.verifyOtp(this.formValue).subscribe({
      next: (res: any) => {
        // this.loaderService.hideLoader()
        if (res.status==200) {
          console.log(res)
          sessionStorage.setItem('token', res.data)
          this.toaster.success("Otp verified")
          this.loader.hide()
          console.log(this.role)
          if(this.role=="1"){
            this.router.navigateByUrl('/provider')
          }else if(this.role=="2"){
            this.router.navigateByUrl('/patient')
          }
        }else if(res.status==401){
          // this.loaderService.showLoader()
          this.loader.hide()
          this.toaster.show("Wrong OTP")
        }
        else {
          console.log(res);
          // this.loaderService.showLoader()
          this.loader.hide()
          this.toaster.show("Server Error Occur");
        }
      },
      error: (error: any) => {
        if (error) {
          this.loader.hide()
          this.toaster.show("Invalid Credential");
        } else {
          this.loader.hide()
          this.toaster.show(JSON.stringify(error));
          console.log(error);
        }
      }
    })
  }
}
