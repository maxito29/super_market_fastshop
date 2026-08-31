import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private router = inject(Router);
  private catalogoService = inject(CatalogoService);

  private categoriaId$ = this.route.paramMap.pipe(map(p => Number(p.get('id'))));

  // Texto opcional que llega por query param (?q=leche) cuando se entra a
  // esta categoría desde una búsqueda del header, para acotar la vitrina a
  // solo los productos que coinciden con ese término dentro de la categoría.
  textoBusqueda = toSignal(
    this.route.queryParamMap.pipe(map(params => (params.get('q') ?? '').trim())),
    { initialValue: '' }
  );

  categoria = toSignal(this.categoriaId$.pipe(switchMap(id => this.catalogoService.obtenerCategoria(id))));

  private productosCategoria = toSignal(
    this.categoriaId$.pipe(switchMap(id => this.catalogoService.listarProductosPorCategoria(id))),
    { initialValue: [] }
  );

  productos = computed(() => {
    const texto = this.textoBusqueda().toLowerCase();
    const lista = this.productosCategoria();
    if (!texto) {
      return lista;
    }
    return lista.filter(producto => producto.nombre.toLowerCase().includes(texto));
  });

  quitarFiltroTexto(): void {
    // Se quita el query param "q" de la URL; el signal de texto se
    // actualiza solo al reaccionar a queryParamMap, mostrando de nuevo
    // todos los productos de la categoría.
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  retrasoAnimacion(i: number): string {
    return `${Math.min(i, 11) * 45}ms`;
  }
}