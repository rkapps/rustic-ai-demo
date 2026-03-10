import { Injectable, inject, signal, computed, effect } from '@angular/core';
import {
    Auth,
    user,
    User,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    createUserWithEmailAndPassword,
    updateProfile
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private router = inject(Router);

    public user$ = user(this.auth);
    currentUser = toSignal(this.user$, { initialValue: null });
    isAuthenticated = computed(() => !!this.currentUser());

    async loginWithEmail(email: string, pass: string) {
        return await signInWithEmailAndPassword(this.auth, email, pass);
    }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(this.auth, provider);
    }

    async logout() {
        await signOut(this.auth);
        this.router.navigate(['/home']);
    }
}
