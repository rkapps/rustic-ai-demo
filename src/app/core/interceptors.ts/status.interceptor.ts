// core/interceptors/status.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const statusInterceptor: HttpInterceptorFn = (req, next) => {
    const notify = inject(NotificationService);

    // Increment the active request counter
    notify.startLoading();
    return next(req).pipe(
        finalize(() => {
            // Decrement when request finishes (Success or Error)
            notify.stopLoading();
        })
    );
};
