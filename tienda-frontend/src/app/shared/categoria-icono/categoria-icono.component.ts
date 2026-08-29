import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { obtenerTipoIconoCategoria, TipoIconoCategoria } from '../../core/utils/categoria-icono.util';


@Component({
  selector: 'app-categoria-icono',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categoria-icono.component.html',
  styleUrl: './categoria-icono.component.scss'
})
export class CategoriaIconoComponent {
  @Input({ required: true }) nombre = '';

  get tipo(): TipoIconoCategoria {
    return obtenerTipoIconoCategoria(this.nombre);
  }
}