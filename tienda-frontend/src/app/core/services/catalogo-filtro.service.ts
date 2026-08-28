import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CatalogoFiltroService {
  categoriaId = signal<number | null>(null);

  seleccionar(id: number | null): void {
    this.categoriaId.set(id);
  }
}