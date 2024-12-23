import { Component } from '@angular/core';
import { LoaderServiceService } from '../../Services/loader-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  loading = false;

  constructor(private loaderService: LoaderServiceService) {}

  ngOnInit(): void {
    // Subscribe to the loading state
    this.loaderService.loading$.subscribe((loading) => {
      this.loading = loading;
    });
  }
}
