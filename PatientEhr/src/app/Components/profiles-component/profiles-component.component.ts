import { Component, inject } from '@angular/core';
import { UserService } from '../../Services/User/user.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserPlatformLocation, CommonModule } from '@angular/common';
import { LoaderComponent } from "../loader/loader.component";
import { LoaderServiceService } from '../../Services/loader-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profiles-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './profiles-component.component.html',
  styleUrl: './profiles-component.component.css'
})
export class ProfilesComponentComponent {
  userService = inject(UserService);
  fb = inject(FormBuilder);
  loader=inject(LoaderServiceService)
  toast=inject(ToastrService)
  countries: any[] = [];  // Array to hold countries
  states: any[] = [];  // Array to hold states

  userDataForm: FormGroup;
  email = sessionStorage.getItem('email');
  userId = sessionStorage.getItem('id');  // Fetching user ID from sessionStorage
  isEditMode = false;
  selectedFile: any;
  maxDate:any;

  constructor() {
    this.userDataForm = this.fb.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl({ value: '', disabled: true }),  // Email is read-only
      userName: new FormControl({ value: '', disabled: true }), // Username is read-only
      mobile: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
      dateOfBirth: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      bloodGroup: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      pinCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
      profileImage: new FormControl(''),
      userTypeId: new FormControl(''),
      
      // Provider-specific fields (initially empty, visible only if id = 1)
      qualification: new FormControl(''),
      specializationId: new FormControl(''),
      registrationNumber: new FormControl(''),
      visitingCharge: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.fetchCountries(); // Fetch countries
    this.getUserDetails();
    const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based
      const yyyy = today.getFullYear();
      this.maxDate = `${yyyy}-${mm}-${dd}`;
  }

  getUserDetails() {
    if (this.email) {
      this.userService.getUserByEmail(this.email).subscribe((res: any) => {
        console.log(res);
        this.userDataForm.patchValue(res.data[0]);
      });
    }
  }

  fetchCountries() {
    this.userService.getCountry().subscribe({
      next: (res) => {
        this.countries = res.data;
      },
      error: () => {
        this.toast.error('Failed to load countries.', 'Error');
      },
    });
  }

  fetchStates(countryId: string) {
    this.userService.getState(countryId).subscribe({
      next: (res) => {
        console.log(res)
        this.states = res.data;
        console.log(this.states)
      },
      error: () => {
        this.toast.error('Failed to load states.', 'Error');
      },
    });
  }

  onCountryChange() {
    const countryId = this.userDataForm.get('country')?.value;
    this.userService.getIdByName(countryId).subscribe((res:any)=>{
      console.log(res)
      this.fetchStates(res.data[0].id)
    })
  }

  restrictInput(event: any) {
    const input = event.target.value;
    const numericValue = input.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
    if (numericValue.length > 10) {
      event.target.value = numericValue.slice(0, 10); // Limit to 10 digits
    } else {
      event.target.value = numericValue;
    }
  }

  onKeyPress(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
  
    // Check if the key pressed is a numeric key (0-9) or control keys (Backspace, Tab, etc.)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Block non-numeric input
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.userDataForm.enable();
    } else {
      this.userDataForm.disable();
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userDataForm.patchValue({ profileImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile() {
    this.loader.show()
    if (this.userDataForm.valid) {
      if (this.selectedFile) {
        // Create a FormData object for file upload
        const formData = new FormData();
        formData.append('file', this.selectedFile);
  
        // Upload the profile image
        this.userService.uploadImage(formData).subscribe(
          (imageRes: any) => {
            if (imageRes.result.status == 200) {
              // Set the profile image URL in the form control after upload
              this.userDataForm.patchValue({ profileImage: imageRes.result.data });
  
              // Update the user profile data with the new form values
              this.userService.updateUser(this.userDataForm.value).subscribe((res: any) => {
                if (res.status == 200) {
                  // Success actions
                  this.toast.success("User Updated Successfully")
                  this.isEditMode = false;
                  this.userDataForm.disable();
                  this.loader.hide()
                } else {
                  // Error handling for profile update failure
                  this.toast.show("Error uploading image")
                  this.loader.hide()
                }
              });
            } else {
              this.toast.show("Error uploading image")
              this.loader.hide()
              // Error handling for image upload failure
            }
          },
          (error) => {
            this.toast.show("Error uploading image")
            this.loader.hide()
            // Error handling for image upload failure
          }
        );
      } else {
        // If no new file is selected, only update the user profile without image upload
        this.userService.updateUser(this.userDataForm.value).subscribe((res: any) => {
          if (res.status == 200) {
            // Success actions
            this.toast.show("User Updated Successfully")
            this.loader.hide()
            this.isEditMode = false;
            this.userDataForm.disable();
          } else {
            // Error handling for profile update failure
            this.loader.hide()
            this.toast.show(res.message || "Something went wrong")
          }
        });
      }
    } else {
      // Handle form validation errors
      this.toast.show("Something went wrong")
      this.loader.hide()
    }
  }

  formInvalid(): boolean {
    return this.userDataForm.invalid;
  }

  get isProvider(): boolean {
    return this.userId == '1'; // Check if the user ID is 1 to show provider-specific fields
  }
}
