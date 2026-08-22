import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './confirmacion.component.html',
  styleUrl: './confirmacion.component.scss'
})
export class ConfirmacionComponent {
  numeroPedido: string;

  constructor(route: ActivatedRoute) {
    this.numeroPedido = route.snapshot.paramMap.get('numeroPedido') ?? '';
  }
}
