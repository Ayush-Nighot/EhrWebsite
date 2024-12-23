import { Component, inject } from "@angular/core";
import { AppointmentService } from "../../Services/Appointment/appointment.service";
import { UserService } from "../../Services/User/user.service";
import { CommonModule } from "@angular/common";
import { SoapNoteService } from "../../Services/soap-note.service";
import { LoaderComponent } from "../loader/loader.component";
import { ToastrService } from "ngx-toastr";
import { LoaderServiceService } from "../../Services/loader-service.service";

@Component({
  selector: "app-completed",
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: "./completed.component.html",
  styleUrl: "./completed.component.css",
})
export class CompletedComponent {
appointment = inject(AppointmentService);
  userService = inject(UserService);
  toast=inject(ToastrService)
  loader=inject(LoaderServiceService)
  id = sessionStorage.getItem("userId");
  app: any[] = [];
  comp: any[] = [];
  soapNote = inject(SoapNoteService);
  soap: any; // This will store the SOAP data for the currently selected appointment
  showSOAPModal = false; // This flag will control the visibility of the modal

  constructor() {
    this.getCompletedAppointment();
  }

  getCompletedAppointment() {
    this.appointment.getCompletedAppointment(this.id).subscribe((res: any) => {
      this.app = res.data;
      this.app.forEach((appointment: any) => {
        this.loadPatientDetails(appointment.patientId, appointment); // Pass the appointment to loadPatientDetails
      });
    });
  }

  loadPatientDetails(patientId: number, appointment: any): void {
    this.userService.getUserById(patientId).subscribe(
      (patientResponse: any) => {
        // Add patient details directly into the appointment object
        appointment.patientDetails = patientResponse.data[0];
      },
      (error: any) => {
        console.error("Error fetching patient details:", error);
      }
    );
  }

  viewSOAP(appointment: any): void {
    console.log("View SOAP for appointment:", appointment);
    this.soapNote.getSoapByAppointmentId(appointment).subscribe((res: any) => {
      this.soap = res;  // Store the SOAP data
      console.log(this.soap)
      this.showSOAPModal = true;  // Show the modal when SOAP data is fetched
    });
  }

  closeSOAPModal(): void {
    this.showSOAPModal = false;  // Close the modal
  }
}
