import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CostCalculatorComponent } from './components/cost-calculator/cost-calculator.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <app-cost-calculator></app-cost-calculator>
    </div>
    <router-outlet />
  `,
  styles: [
    `
      .app {
        min-height: 100vh;
        background: #f5f7fa;
      }
    `,
  ],
  imports: [CommonModule, RouterOutlet, CostCalculatorComponent],
  standalone: true,
})
export class App {
  title = 'remote-flows-angular';
}
