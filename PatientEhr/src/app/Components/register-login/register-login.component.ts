import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../Services/User/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { LoaderServiceService } from '../../Services/loader-service.service';

@Component({
  selector: 'app-register-login',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterLink,LoaderComponent],
  templateUrl: './register-login.component.html',
  styleUrl: './register-login.component.css'
})
export class RegisterLoginComponent {
  countryList: any[] = [];
  states: any[] = [];
  loginForm: FormGroup;
  registerForm: FormGroup;
  showRegisterOptions: boolean = false;
  isProviderSelected: boolean = false;
  userService=inject(UserService)
  registerData:any;
  registerDataPatient:any;
  router=inject(Router)
  toast=inject(ToastrService)
  specialization:any;
  loader=inject(LoaderServiceService)
  
  
  fetchCountries() {
    this.userService.getCountry().subscribe({
      next: (res) => {
        this.countryList = res.data;
      },
      error: () => {
        this.toast.error('Failed to load countries.', 'Error', {
          timeOut: 3000,
          closeButton: true,
        });
      },
    });
  }
  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onCountryChange() {
    const countryId = this.registerForm.get('country')?.value;
    if (countryId) {
      this.userService.getIdByName(countryId).subscribe({
        next: (res) => {
          console.log(res)
          this.userService.getState(res.data[0].id).subscribe((res:any)=>{
            this.states=res.data
          })
        },
        error: () => {
          this.toast.error('Failed to load states.', 'Error', {
            timeOut: 3000,
            closeButton: true,
          });
        },
      });
    } else {
      this.states = [];
    }
  }


  maxDate: string="";
  constructor(private fb: FormBuilder) {
    this.getSpecializations()

    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      bloodGroup: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      profileImage: [''],
      userTypeId:[''],

      // Provider-specific fields (initially empty)
      qualification: [''],
      specializationId: [''],
      registrationNumber: [''],
      visitingCharge: ['']
    });
   }

   getSpecializations(){
    this.userService.getSpecializations().subscribe((res:any)=>{
      this.specialization=res.data
    })
   }
   
    ngOnInit(): void {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based
      const yyyy = today.getFullYear();
      this.maxDate = `${yyyy}-${mm}-${dd}`;
      this.fetchCountries()
    }



    get today(): string {
      const today = new Date();
      today.setDate(today.getDate() );
      return today.toISOString().split('T')[0]; // Format as 'yyyy-MM-dd'
    }
   
    show(){
      this.showRegisterOptions=false
    }

   onKeyPress(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); 
    }
  }


  // Login form submission
  onLoginSubmit(): void {
    this.loader.show()
    if (this.loginForm.invalid) {
      this.toast.warning('Login form is invalid');
      this.loader.hide()
      return;
    }
    console.log('Login Data:', this.loginForm.value);
    this.userService.login(this.loginForm.value).subscribe((res:any)=>{
      if(res.status==200){
        this.toast.success("Login Successfylly")
        this.loader.hide()
        // console.log(res)
        sessionStorage.setItem('id', res.data.userTypeId);
        sessionStorage.setItem('userId',res.data.id)
        sessionStorage.setItem('email', res.data.email);
        sessionStorage.setItem('profileImg', res.data.profileImage);
        this.router.navigateByUrl('verify-otp')
      }
    },(error) => {
      console.error('Error:', error);
      this.loader.hide()
      this.toast.error('Login failed. Please check your credentials.');
    })
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registerForm.patchValue({
        profileImage: file,
      });
    }
  }
  

  // Register form submission
  onRegisterSubmit(): void {
    this.loader.show()
    if (this.registerForm.invalid) {
      this.toast.warning('Register form is invalid');
      this.loader.hide()
      return;
    }
    const profileImage = this.registerForm.get('profileImage')?.value;
      const formData = new FormData();
      formData.append('file', profileImage);
  
      this.userService.uploadImage(formData).subscribe({
        next: (res: any) => {
          console.log(res)
          const imagePath = res.result.data;
          this.registerForm.patchValue({
            profileImage: imagePath, 
          });
        
          if(this.isProviderSelected){
            this.registerForm.value.userTypeId=1
          }else{
            this.registerForm.value.userTypeId=2
          }

          this.registerData = { ...this.registerForm.value };
                
          if(!this.isProviderSelected){
            delete this.registerForm.value.specializationId;
            delete this.registerForm.value.visitingCharge;
            delete this.registerForm.value.registrationNumber;
            delete this.registerForm.value.qualification;
            
            this.registerData = { ...this.registerForm.value };
            this.userService.register(this.registerData).subscribe((res: any) => {
              console.log(res)
              if (res.status==200) {
                this.loader.hide()
                  this.toast.success("User Registered Successfully")
                  this.showRegisterOptions=false
              }else if(res.status==409){
                // this.loaderService.hideLoader()
                this.toast.show(res.message)
                this.loader.hide()
              } else {
                this.toast.error(res.message || 'Registration failed.', 'Error', {
                  timeOut: 3000,
                  closeButton: true,
                });
                this.loader.hide()
              }
            })
          }else{
            this.userService.register(this.registerData).subscribe((res: any) => {
              console.log(res)
              if (res.status==200) {
                  this.toast.success("User Registered Successfully")
                  this.showRegisterOptions=false
                  this.loader.hide()
              }else if(res.status==409){
                // this.loaderService.hideLoader()
                this.toast.show(res.message)
                this.loader.hide()
              } else {
                this.toast.error(res.message || 'Registration failed.', 'Error', {
                  timeOut: 3000,
                  closeButton: true,
                });
                this.loader.hide()
              }
            })
          }
        },
        error: () => {
          this.loader.hide()
          this.toast.error('Error uploading image. Please try again.', 'Error', {
            timeOut: 3000,
            closeButton: true,
          });
        }
      });
  }

  // Show the Register options after clicking "Register"
  showRegisterForm(): void {
    this.showRegisterOptions = true;
  }

  // Select Provider: Display Provider-specific fields
  selectProvider(): void {
    this.isProviderSelected = true;
    this.registerForm.addControl('qualification', this.fb.control('', [Validators.required]));
    this.registerForm.addControl('specializationId', this.fb.control('', [Validators.required]));
    this.registerForm.addControl('registrationNumber', this.fb.control('', [Validators.required]));
    this.registerForm.addControl('visitingCharge', this.fb.control('', [Validators.required]));
  }

  // Select Patient: Remove Provider-specific fields
  selectPatient(): void {
    this.isProviderSelected = false;
    this.registerForm.removeControl('qualification');
    this.registerForm.removeControl('specializationId');
    this.registerForm.removeControl('registrationNumber');
    this.registerForm.removeControl('visitingCharge');
  }
}
