export interface CategoriaConteo {
  categoria: string;
  cantidad: number;
}

export interface ProductoStock {
  nombre: string;
  stock: number;
}

export interface DashboardResumen {
  totalProductos: number;
  totalCategorias: number;
  totalTrabajadores: number;
  productosStockBajo: number;
  productosPorCategoria: CategoriaConteo[];
  topProductosStock: ProductoStock[];
}