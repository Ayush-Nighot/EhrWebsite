import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SoapNoteService {

  http=inject(HttpClient)
  
  addSoap(obj:any):Observable<any>{
    return this.http.post(`https://localhost:7122/api/SoapNote`,obj)
  } 

  getSoapByAppointmentId(obj:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/SoapNote/${obj}`)
  }

}
