import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth, idToken } from '@angular/fire/auth';
import { first, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(Auth);

    return idToken(auth).pipe(
        first(),
        switchMap(token => {
            if (!token) return next(req);
            return next(req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }));
        })
    );
};
