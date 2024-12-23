import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {

  public data: any;

  setData(obj: any) {
    this.data = obj;
  }

  getData() {
    return this.data;
  }
}
