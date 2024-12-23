import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export const patientGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const toaster = inject(ToastrService);
  const roleId = sessionStorage.getItem('id');

  try {
    if (roleId == "2") {
      
      return true;  // User can access
    } else {
      // Show the toast message first
     if(roleId=="1"){
      toaster.error('You do not have permission to access this page', 'Unauthorized');
      router.navigateByUrl('/provider');  // Redirect to admin page
      return false;  // Prevent route access
     }else{
      toaster.error('You do not have permission to access this page', 'Unauthorized');
      router.navigateByUrl('/login');  // Redirect to admin page
      return false;
     }
    }
  } catch (error) {
    console.error('Error checking role:', error);
    router.navigateByUrl('/login');
    toaster.error('An error occurred. Please login again.', 'Error');
    
    // Navigate to login after showing the error
    setTimeout(() => {
      router.navigateByUrl('/login');
    }, 3000);  // Delay navigation after the toast message
    return false;
  }
};
