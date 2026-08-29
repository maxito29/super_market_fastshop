import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/catalogo/catalogo.component').then(m => m.CatalogoComponent) },
  { path: 'categoria/:id', loadComponent: () => import('./features/categoria-detalle/categoria-detalle.component').then(m => m.CategoriaDetalleComponent) },
  { path: 'producto/:id', loadComponent: () => import('./features/producto-detalle/producto-detalle.component').then(m => m.ProductoDetalleComponent) },
  { path: 'carrito', loadComponent: () => import('./features/carrito/carrito.component').then(m => m.CarritoComponent) },
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'pedido-confirmado/:numeroPedido', loadComponent: () => import('./features/confirmacion/confirmacion.component').then(m => m.ConfirmacionComponent) },
  { path: 'mi-pedido', loadComponent: () => import('./features/mi-pedido/mi-pedido.component').then(m => m.MiPedidoComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: '**', redirectTo: '' }
];