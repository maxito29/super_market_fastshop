import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CatalogoFiltroService {
  categoriaId = signal<number | null>(null);
  texto = signal<string>('');

  seleccionar(id: number | null): void {
    this.texto.set('');
    this.categoriaId.set(id);
  }

  buscar(texto: string): void {
    this.categoriaId.set(null);
    this.texto.set(texto.trim());
  }

  limpiarBusqueda(): void {
    this.texto.set('');
  }
}