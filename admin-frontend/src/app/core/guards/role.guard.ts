import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(rolesPermitidos: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const rolActual = authService.usuarioActual()?.rol;

    if (rolActual && rolesPermitidos.includes(rolActual)) {
      return true;
    }

    router.navigate(['/login']);
    return false;
  };
}