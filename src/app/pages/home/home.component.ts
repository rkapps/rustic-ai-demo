import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div>

      <!-- Tailwind Typography 'prose' class handles the styling -->
      <article class="prose prose-slate lg:prose-lg">
        <h1>Welcome to the RusticAI Demo</h1>
        <p class="lead">
                
        </p>
        
      </article>
</div>
  `
})
export default class HomeComponent {}
