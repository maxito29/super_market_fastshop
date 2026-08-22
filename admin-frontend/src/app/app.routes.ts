import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { OlvidePasswordComponent } from './features/auth/olvide-password/olvide-password.component';
import { RestablecerPasswordComponent } from './features/auth/restablecer-password/restablecer-password.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CategoriasComponent } from './features/categorias/categorias.component';
import { ProductosComponent } from './features/productos/productos.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { PedidosAdminComponent } from './features/pedidos-admin/pedidos-admin.component';
import { PickerPanelComponent } from './features/picker/picker-panel.component';
import { RepartidorPanelComponent } from './features/repartidor/repartidor-panel.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'olvide-password', component: OlvidePasswordComponent },
  { path: 'restablecer-password', component: RestablecerPasswordComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'categorias', component: CategoriasComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'productos', component: ProductosComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'pedidos-admin', component: PedidosAdminComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'picker', component: PickerPanelComponent, canActivate: [roleGuard(['PICKER'])] },
      { path: 'repartidor', component: RepartidorPanelComponent, canActivate: [roleGuard(['REPARTIDOR'])] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: 'login' }
];