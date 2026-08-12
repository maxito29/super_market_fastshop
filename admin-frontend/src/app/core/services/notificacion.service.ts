import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

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

  notificarCreacion(mensaje: string): void {
    this.toast(mensaje, 'info');
  }

  notificarEdicion(mensaje: string): void {
    this.toast(mensaje, 'warning');
  }

  notificarEliminacion(mensaje: string): void {
    this.toast(mensaje, 'error');
  }

  notificarReactivacion(mensaje: string): void {
    this.toast(mensaje, 'success');
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

  private toast(mensaje: string, icon: SweetAlertIcon): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: mensaje,
      showConfirmButton: false,
      timer: 2500,
    });
  }
}