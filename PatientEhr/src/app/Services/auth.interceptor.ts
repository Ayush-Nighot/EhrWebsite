import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoaderServiceService } from './loader-service.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService =inject(LoaderServiceService)

  // Show loader before the HTTP request is sent
 

  const token = sessionStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`, // Attach the auth token to the request headers
      }
    });
  }

  // Return the response, hiding the loader when the request is complete
  return next(req)
  // .pipe(
  //   finalize(() => {
  //     // Hide the loader after the request completes (either success or error)
  //     loaderService.hide();
  //   })
  // );
};
