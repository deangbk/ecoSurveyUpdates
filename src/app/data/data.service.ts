import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  baseUrl = 'http://localhost/SurveyAutomate';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.log(error);
    // return an observable with a user message
    return throwError('Error! something went wrong.');
  }

  //Grab average score per comp
  getAvgComp(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/avg/comp`)
      .pipe(catchError(this.handleError));
  }

  //Grab average score per dimension
  getAvgDim(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/avg/dim`)
      .pipe(catchError(this.handleError));
  }

  //Grab average score per department
  getAvgDept(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/avg/dept`)
      .pipe(catchError(this.handleError));
  }

  //Grab average score per question
  getAvgQues(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/avg/question`)
      .pipe(catchError(this.handleError));
  }

  //Grab count of each answer choice per question (percentage chart)
  getCountQues(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/count/question`)
      .pipe(catchError(this.handleError));
  }

  //Grab count of each answer choice per dept (percentage chart)
  getCountDept(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/count/dept`)
      .pipe(catchError(this.handleError));
  }

  //Grab mode score per dimension
  getModeDim(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/mode/dim`)
      .pipe(catchError(this.handleError));
  }

  getRepsonseCount(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/res/country`)
      .pipe(catchError(this.handleError));
  }
  getRepsonseDepart(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/res/department`)
      .pipe(catchError(this.handleError));
  }

  getAvgCountry(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/avg/country`)
      .pipe(catchError(this.handleError));
  }

  
  getAvgPerCountry($Country): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/avg/percountry/${$Country}`)
      .pipe(catchError(this.handleError));
  }

//Grab count of each answer choice per question (percentage chart)
getCountQuesCountry($Country): Observable<any> {
  return this.http
    .get(`${this.baseUrl}/count/questionCountry/${$Country}`)
    .pipe(catchError(this.handleError));
}
//Grab average score of each answer filter by country
getAvgQuesCountry($Country): Observable<any> {
  return this.http
    .get(`${this.baseUrl}/avg/questionCountry/${$Country}`)
    .pipe(catchError(this.handleError));
}

getDimCount($Country): Observable<any> {
  return this.http
    .get(`${this.baseUrl}/avg/dimCountry/${$Country}`)
    .pipe(catchError(this.handleError));
}
getDimDepCount($Country): Observable<any> {
  return this.http
    .get(`${this.baseUrl}/avg/dimDepartment/${$Country}`)
    .pipe(catchError(this.handleError));
}

}
