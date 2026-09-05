import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClienteAuthService } from '../services/cliente-auth.service';

export const clienteGuard: CanActivateFn = () => {
  const clienteAuth = inject(ClienteAuthService);
  const router = inject(Router);

  if (clienteAuth.cliente()) {
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};