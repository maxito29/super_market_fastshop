import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Categoria, MetodoPago, OfertaProducto, Producto } from '../models/catalogo.models';

@Injectable({ providedIn: 'root' })
export class CatalogoService {

  constructor(private http: HttpClient) {}

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${API_URL}/categorias`);
  }

  listarProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API_URL}/productos`);
  }

  listarProductosPorCategoria(categoriaId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API_URL}/productos/categoria/${categoriaId}`);
  }

  buscarProductos(texto: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API_URL}/productos/buscar`, { params: { q: texto } });
  }

  listarOfertas(productoId: number): Observable<OfertaProducto[]> {
    return this.http.get<OfertaProducto[]>(`${API_URL}/productos/${productoId}/ofertas`);
  }

  listarMetodosPago(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(`${API_URL}/metodos-pago`);
  }

  obtenerProducto(id: number): Observable<Producto> {
  return this.http.get<Producto>(`${API_URL}/productos/${id}`);
}

obtenerCategoria(id: number): Observable<Categoria> {
  return this.http.get<Categoria>(`${API_URL}/categorias/${id}`);
}
listarDestacados(): Observable<Producto[]> {
  return this.http.get<Producto[]>(`${API_URL}/productos/destacados`);
}
}