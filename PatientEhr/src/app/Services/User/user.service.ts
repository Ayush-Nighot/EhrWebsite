import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  http=inject(HttpClient)

  uploadImage(obj:any){
    return this.http.post(`https://localhost:7122/api/Image/UploadFile`,obj)
  }
  
  register(obj:any):Observable<any>{
    return this.http.post(`https://localhost:7122/api/User/register`,obj)
  }

  login(obj:any):Observable<any>{
    return this.http.post(`https://localhost:7122/api/User/login`,obj)
  }

  verifyOtp(obj:any):Observable<any>{
    return this.http.post(`https://localhost:7122/api/User/verify-otp`,obj)
  }

  forgetPassword(obj:any):Observable<any>{
    return this.http.post(`https://localhost:7122/api/User/forget-password?email=${obj}`,{})
  }

  changePassword(obj:any):Observable<any>{
    return this.http.post(`https://localhost:7122/api/User/change-password`,obj)
  }

  updateUser(obj:any):Observable<any>{
    return this.http.put(`https://localhost:7122/api/User/update`,obj)
  }

  getAllUser():Observable<any>{
    return this.http.get(`https://localhost:7122/api/User`)
  }

  getUserByEmail(email:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/User/${email}`)
  }

  getSpecializations():Observable<any>{
    return this.http.get(`https://localhost:7122/api/User/getspecialization`)
  }

  getSpecializationName(id:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/User/specialization?id=${id}`)
  }

  getVisitingFee(id:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/User/visitingfee?id=${id}`)
  }

  getUserById(id:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/User/getbyid?id=${id}`)
  }

  getCountry():Observable<any>{
    return this.http.get(`https://localhost:7122/api/User/country`)
  }
  getState(obj:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/User/states?id=${obj}`)
  }

  getIdByName(obj:any):Observable<any>{
    return this.http.get(`https://localhost:7122/api/User/idcountry?id=${obj}`)
  }
}
