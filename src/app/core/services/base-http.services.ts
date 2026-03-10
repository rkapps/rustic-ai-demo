import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export abstract class BaseHttpService {
    protected http = inject(HttpClient);
    protected abstract baseUrl: string;

    constructor() {
        console.log('Production:', environment.production);
      }

    /**
     * Generic GET request
     */
    protected get<T>(endpoint: string, params?: HttpParams): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params })
            .pipe(catchError(this.handleError));
    }

    /**
     * Generic POST request
     */
    protected post<T>(endpoint: string, body: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${endpoint}`, body)
            .pipe(catchError(this.handleError));
    }

    /**
     * Generic PUT request
     */
    protected put<T>(endpoint: string, body: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${endpoint}`, body)
            .pipe(catchError(this.handleError));
    }

    /**
     * Generic DELETE request
     */
    protected delete<T>(endpoint: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${endpoint}`)
            .pipe(catchError(this.handleError));
    }

    /**
     * Generic PATCH request
     */
    protected patch<T>(endpoint: string, body: any): Observable<T> {
        return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body)
            .pipe(catchError(this.handleError));
    }

    /**
     * Error handler - can be overridden in derived classes
     */
    protected handleError(error: any): Observable<never> {
        console.error('API Error:', error);
        return throwError(() => error);
    }
}