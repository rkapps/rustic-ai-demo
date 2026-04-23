import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(Auth);
    const currentUser = auth.currentUser;

    if (!currentUser) return next(req);

    return from(currentUser.getIdToken()).pipe(
        switchMap(token =>
            next(req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }))
        )
    );
};
