import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Producto } from '../../core/models/catalogo.models';

@Component({
  selector: 'app-vitrina-productos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vitrina-productos.component.html',
  styleUrl: './vitrina-productos.component.scss'
})
export class VitrinaProductosComponent {
  @Input({ required: true }) titulo!: string;
  @Input() icono = 'pi pi-star-fill';
  @Input() acento: 'verde' | 'tomate' = 'verde';
  @Input({ required: true }) productos: Producto[] = [];
  @Input() verTodoRuta: any[] | null = null;

  retrasoAnimacion(indice: number): string {
    return `${Math.min(indice, 11) * 45}ms`;
  }
}