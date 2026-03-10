import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [RouterOutlet],
    template: `

          Dashboard 
          <div> 
                <button (click)="analyticsClicked()">analytics</button>
                <button (click)="reportsClicked()">reports</button>
          </div>
          <router-outlet></router-outlet>

    `
  })
  export default class DashboardComponent {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
  
    analyticsClicked() {
        this.router.navigate(['/dashboard', 'analytics']);
    }

    reportsClicked() {
        this.router.navigate(['/dashboard', 'reports']);
    }
  }
  