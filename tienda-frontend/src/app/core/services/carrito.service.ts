import { Injectable, computed, signal } from '@angular/core';
import { ItemCarrito } from '../models/carrito.models';

const STORAGE_KEY = 'tienda_carrito';

function claveItem(productoId: number, ofertaProductoId: number | null): string {
  return `${productoId}-${ofertaProductoId ?? 'base'}`;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {

  private itemsSignal = signal<ItemCarrito[]>(this.cargarDeStorage());

  readonly items = this.itemsSignal.asReadonly();

  readonly totalItems = computed(() =>
    this.itemsSignal().reduce((acumulado, item) => acumulado + item.cantidad, 0)
  );

  readonly totalPagar = computed(() =>
    this.itemsSignal().reduce((acumulado, item) => acumulado + item.cantidad * item.precioUnitario, 0)
  );

  agregar(nuevoItem: ItemCarrito): void {
    const clave = claveItem(nuevoItem.productoId, nuevoItem.ofertaProductoId);

    this.itemsSignal.update(items => {
      const existente = items.find(i => claveItem(i.productoId, i.ofertaProductoId) === clave);

      if (existente) {
        return items.map(i =>
          claveItem(i.productoId, i.ofertaProductoId) === clave
            ? { ...i, cantidad: i.cantidad + nuevoItem.cantidad }
            : i
        );
      }

      return [...items, nuevoItem];
    });

    this.guardarEnStorage();
  }

  cambiarCantidad(productoId: number, ofertaProductoId: number | null, cantidad: number): void {
    const clave = claveItem(productoId, ofertaProductoId);
    this.itemsSignal.update(items =>
      items.map(i => (claveItem(i.productoId, i.ofertaProductoId) === clave ? { ...i, cantidad } : i))
    );
    this.guardarEnStorage();
  }

  quitar(productoId: number, ofertaProductoId: number | null): void {
    const clave = claveItem(productoId, ofertaProductoId);
    this.itemsSignal.update(items =>
      items.filter(i => claveItem(i.productoId, i.ofertaProductoId) !== clave)
    );
    this.guardarEnStorage();
  }

  vaciar(): void {
    this.itemsSignal.set([]);
    this.guardarEnStorage();
  }

  private guardarEnStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.itemsSignal()));
  }

  private cargarDeStorage(): ItemCarrito[] {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  }
}
