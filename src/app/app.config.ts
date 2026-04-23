import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, SecurityContext } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors.ts/error.interceptor';
import { statusInterceptor } from './core/interceptors.ts/status.interceptor';
import { authInterceptor } from './core/interceptors.ts/auth.interceptor';
import { LucideAngularModule, Search, Mail, ArrowRight, Plus, MessageCirclePlus, MessageSquarePlus, MessagesSquare, ArrowUp, ArrowDown, ArrowLeft, LucideLoaderPinwheel, LoaderPinwheel } from 'lucide-angular';
import { MarkdownModule, MarkedOptions, MARKED_OPTIONS, MarkedRenderer, SANITIZE } from 'ngx-markdown';

// Firebase Imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';



export const appConfig: ApplicationConfig = {
  providers: [

    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, statusInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    provideAuth(() => getAuth()),

    importProvidersFrom(
      LucideAngularModule.pick({ Search, Mail, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, MessageSquarePlus, MessagesSquare, LoaderPinwheel }),

      MarkdownModule.forRoot({
        markedOptions: {
          provide: MARKED_OPTIONS, // Use the actual InjectionToken constant
          useValue: {
            gfm: true,
            breaks: true, // This enables single \n as line breaks
            smartLists: true,
            smartypants: false,
          } as MarkedOptions,
        },
        sanitize: {
          provide: SANITIZE,
          useValue: SecurityContext.NONE,
        },
      })
    )

  ]
};
function provideExperimentalZonelessChangeDetection(): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
  throw new Error('Function not implemented.');
}

