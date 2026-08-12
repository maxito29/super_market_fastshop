import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificacionService {

  bienvenida(nombre: string): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `¡Bienvenido, ${nombre}!`,
      showConfirmButton: false,
      timer: 3500,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
  }

  exito(mensaje: string): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: mensaje,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  }

  error(mensaje: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Ups...',
      text: mensaje,
      confirmButtonColor: '#16a34a'
    });
  }

  async confirmarEliminacion(nombreItem: string): Promise<boolean> {
    const resultado = await Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro?',
      text: `Se va a desactivar "${nombreItem}".`,
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    });
    return resultado.isConfirmed;
  }
}