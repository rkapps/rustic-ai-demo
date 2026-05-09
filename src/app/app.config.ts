import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, SecurityContext } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors.ts/error.interceptor';
import { statusInterceptor } from './core/interceptors.ts/status.interceptor';
import { authInterceptor } from './core/interceptors.ts/auth.interceptor';
import {
  LucideAngularModule,
  Search, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus,
  RefreshCw, ChevronLeft, ChevronRight, ChevronDown, Trash2, LoaderCircle,
  Menu, Send, MessageSquare, Mic, MicOff, Square,
  ArrowUpDown, Calendar, X,
  Bot, GraduationCap, Code, ChartBar, BookOpen, Briefcase, Brain, Globe,
  FlaskConical, Pencil, Calculator, Music, Image, FileText, Languages, MessageCircle,
} from 'lucide-angular';
import { MarkdownModule, MarkedOptions, MARKED_OPTIONS, SANITIZE } from 'ngx-markdown';
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
      LucideAngularModule.pick({
        Search, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus,
        RefreshCw, ChevronLeft, ChevronRight, ChevronDown, Trash2, LoaderCircle,
        Menu, Send, MessageSquare, Mic, MicOff, Square,
        ArrowUpDown, Calendar, X,
        Bot, GraduationCap, Code, ChartBar, BookOpen, Briefcase, Brain, Globe,
        FlaskConical, Pencil, Calculator, Music, Image, FileText, Languages, MessageCircle,
      }),
      MarkdownModule.forRoot({
        markedOptions: {
          provide: MARKED_OPTIONS,
          useValue: {
            gfm: true,
            breaks: true,
            smartLists: true,
            smartypants: false,
          } as MarkedOptions,
        },
        sanitize: {
          provide: SANITIZE,
          useValue: SecurityContext.NONE,
        },
      })
    ),
  ]
};
