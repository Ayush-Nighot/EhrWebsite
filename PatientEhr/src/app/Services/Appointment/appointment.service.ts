import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `https://localhost:7122/api`;

  http=inject(HttpClient)
  getPatientAppointments(patientId: number): Observable<any> {
    return this.http.get(`https://localhost:7122/api/Appointment/patient?patientId=${patientId}`);
  }

  // Fetch providers based on specialty
  getProvidersBySpeciality(specialityId: number): Observable<any> {
    return this.http.get(`https://localhost:7122/api/User/providers?id=${specialityId}`);
  }

  // Add a new appointment
  addAppointment(appointmentData: any): Observable<any> {
    return this.http.post(`https://localhost:7122/api/Appointment/addappointment`, appointmentData);
  }

  // Cancel an appointment
  cancelAppointment(appointmentId: number): Observable<any> {
    return this.http.put(`https://localhost:7122/api/Appointment/cancel?appointmentId=${appointmentId}`, {});
  }

  // Complete an appointment
  completeAppointment(appointmentId: number): Observable<any> {
    return this.http.put(`https://localhost:7122/api/Appointment/complete?appointmentId=${appointmentId}`, {});
  }

  createPaymentIntent(num:any):Observable<any>{
    return this.http.post(`https://localhost:7122/api/Appointment/create-payment-intent`,num)
  }

  updateAppointment(obj:any):Observable<any>{
    return this.http.put(`https://localhost:7122/api/Appointment/updateappointment`,obj)
  }

  getAppointmentByProvider(obj:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/Appointment/provider?providerId=${obj}`)
  }

  getCanceledAppointment(obj:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/Appointment/canceled?id=${obj}`)
  }

  getCompletedAppointment(obj:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/Appointment/completed?id=${obj}`)
  }

  getCompletedAppointmentPat(obj:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/Appointment/completedpat?id=${obj}`)
  }
}

