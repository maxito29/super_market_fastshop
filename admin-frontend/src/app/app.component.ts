import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div style="padding: 2rem;">
      <h1>Admin Supermercado</h1>
      <button pButton type="button" label="Probando PrimeNG"></button>
    </div>
  `
})
export class AppComponent {}