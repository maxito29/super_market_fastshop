import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { CatalogoService } from '../../core/services/catalogo.service';

@Component({
  selector: 'app-categoria-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categoria-detalle.component.html',
  styleUrl: './categoria-detalle.component.scss'
})
export class CategoriaDetalleComponent {
  private route = inject(ActivatedRoute);
  private catalogoService = inject(CatalogoService);

  private categoriaId$ = this.route.paramMap.pipe(map(p => Number(p.get('id'))));

  categoria = toSignal(this.categoriaId$.pipe(switchMap(id => this.catalogoService.obtenerCategoria(id))));
  productos = toSignal(
    this.categoriaId$.pipe(switchMap(id => this.catalogoService.listarProductosPorCategoria(id))),
    { initialValue: [] }
  );

  retrasoAnimacion(i: number): string {
    return `${Math.min(i, 11) * 45}ms`;
  }
}