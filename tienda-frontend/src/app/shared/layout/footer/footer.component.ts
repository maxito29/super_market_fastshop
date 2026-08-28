import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  anioActual = new Date().getFullYear();

  correoNewsletter = '';
  aceptaPoliticas = false;
  suscripcionEnviada = false;

  suscribirse(): void {
    if (!this.correoNewsletter || !this.aceptaPoliticas) return;

    this.suscripcionEnviada = true;
    this.correoNewsletter = '';

    setTimeout(() => (this.suscripcionEnviada = false), 4000);
  }
}