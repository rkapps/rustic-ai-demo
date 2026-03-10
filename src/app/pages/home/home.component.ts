import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div>

      <!-- Tailwind Typography 'prose' class handles the styling -->
      <article class="prose prose-slate lg:prose-xl">
        <h1>Welcome to the Starter Kit</h1>
        <p class="lead">
          A clean, responsive starting point using Angular 21, Tailwind CSS 4, and Firebase.
        </p>
        
        <div class="mt-8 flex gap-4 not-prose">
          <a routerLink="/login" 
             class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Get Started
          </a>
          <a href="https://angular.dev" target="_blank"
             class="px-6 py-3 border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition">
            Learn More
          </a>
        </div>
      </article>
</div>
  `
})
export default class HomeComponent {}
