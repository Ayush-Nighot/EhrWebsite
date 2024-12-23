import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../../Services/User/user.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet,CommonModule,RouterLink],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

  router=inject(Router)
  
  email = sessionStorage.getItem('email');
  imageUrl = sessionStorage.getItem('profileImg');
  token=sessionStorage.getItem('token')!;
  decodedtokem:any=jwtDecode(this.token);
  userService=inject(UserService)

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  viewProfile() {
    if (this.email) {
      this.userService.getUserByEmail(this.email).subscribe({
        next: (res:any) => {
          const userData = res.data[0]; 
         this.router.navigateByUrl("/profile")
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }
}
