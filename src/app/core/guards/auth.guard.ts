import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { UserStateService } from '../services/user-state.service';

export const authGuard = (
    route: ActivatedRouteSnapshot, // Information about the specific route being hit
    state: RouterStateSnapshot
) => {
    const router = inject(Router);
    const userState = inject(UserStateService);
    // 2. The "Lock" Logic
    // Check if settings are missing OR not completed
    const isLocked = !userState.userSettings() || !userState.userSettings().completed;
    const isGoingToSettings = state.url.includes('/settings');

    if (isLocked && !isGoingToSettings) {
        console.log('Guard: Redirecting to Settings because app is locked');
        return router.parseUrl('/settings');
    }

    return true;
};