import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { GOOGLE_CLIENT_ID } from '../../core/config/api.config';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';

import { ClienteAuthService } from '../../core/services/cliente-auth.service';
import { TipoDocumentoCliente } from '../../core/models/auth.models';

declare const google: any;

type ModoAuth = 'login' | 'registro' | 'olvide' | 'restablecer';

const SEGUNDOS_ESPERA_REENVIO = 45;
const ETIQUETAS_FUERZA = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente'];

interface ReglaDocumento {
  longitudMin: number;
  longitudMax: number;
  soloNumeros: boolean;
  mensaje: string;
  placeholder: string;
}

const REGLAS_DOCUMENTO: Record<TipoDocumentoCliente, ReglaDocumento> = {
  DNI: { longitudMin: 8, longitudMax: 8, soloNumeros: true, mensaje: 'El DNI debe tener 8 dígitos', placeholder: '00000000' },
  RUC: { longitudMin: 11, longitudMax: 11, soloNumeros: true, mensaje: 'El RUC debe tener 11 dígitos', placeholder: '20000000000' },
  CE: { longitudMin: 9, longitudMax: 12, soloNumeros: false, mensaje: 'El carnet debe tener entre 9 y 12 caracteres', placeholder: '00000000AB' }
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit, OnDestroy {

  modo: ModoAuth = 'login';
  enviando = false;
  enviadoExitoso = false;
  mostrarPassword = false;
  mostrarConfirmarPasswordRegistro = false;

  recordarme = false;
  documentoTocado = false;
  emailTocado = false;
  credencialesInvalidas = false;
mensajeErrorCredenciales = '';

  enviandoRecuperacion = false;
  segundosParaReenvio = 0;
  mostrarNuevaPassword = false;
  mostrarConfirmarPassword = false;

  readonly beneficios = [
    { icono: 'pi pi-truck', texto: 'Envío gratis desde S/ 50' },
    { icono: 'pi pi-percentage', texto: 'Compara precios entre proveedores' },
    { icono: 'pi pi-map-marker', texto: 'Recojo en tienda el mismo día' },
    { icono: 'pi pi-star-fill', texto: 'Selección fresca todos los días' }
  ];

  tiposDocumento: { label: string; value: TipoDocumentoCliente }[] = [
    { label: 'DNI', value: 'DNI' },
    { label: 'RUC', value: 'RUC' },
    { label: 'Carnet de Extranjería', value: 'CE' }
  ];

  form = {
    tipoDocumento: 'DNI' as TipoDocumentoCliente,
    numeroDocumento: '',
    password: '',
    confirmarPassword: '',
    nombreRazonSocial: '',
    telefono: '',
    email: '',
    aceptaTerminos: false
  };

  formRecuperacion = {
    email: '',
    codigo: '',
    nuevaPassword: '',
    confirmarPassword: ''
  };

  private temporizadorReenvio?: ReturnType<typeof setInterval>;

  constructor(
    private clienteAuthService: ClienteAuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

cambiarModo(modo: 'login' | 'registro'): void {
  this.modo = modo;
  this.documentoTocado = false;
  this.emailTocado = false;
  this.credencialesInvalidas = false;
  this.mensajeErrorCredenciales = '';

  const tipoDocumentoActual = this.form.tipoDocumento;
  this.form = {
    tipoDocumento: tipoDocumentoActual,
    numeroDocumento: '',
    password: '',
    confirmarPassword: '',
    nombreRazonSocial: '',
    telefono: '',
    email: '',
    aceptaTerminos: false
  };
}

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  indiceTipoDocumento(): number {
    return this.tiposDocumento.findIndex(t => t.value === this.form.tipoDocumento);
  }

  alternarNuevaPassword(): void {
    this.mostrarNuevaPassword = !this.mostrarNuevaPassword;
  }

  alternarConfirmarPassword(): void {
    this.mostrarConfirmarPassword = !this.mostrarConfirmarPassword;
  }

  // ============ Documento ============

cambiarTipoDocumento(tipo: TipoDocumentoCliente): void {
  this.form.tipoDocumento = tipo;
  this.form.numeroDocumento = '';
  this.documentoTocado = false;
  this.credencialesInvalidas = false;
}

  private reglaDocumentoActual(): ReglaDocumento {
    return REGLAS_DOCUMENTO[this.form.tipoDocumento];
  }

  maxLongitudDocumento(): number {
    return this.reglaDocumentoActual().longitudMax;
  }

  placeholderDocumento(): string {
    return this.reglaDocumentoActual().placeholder;
  }

  tipoRequiereNumeros(): boolean {
    return this.reglaDocumentoActual().soloNumeros;
  }

sanitizarNumeroDocumento(evento: Event): void {
  const input = evento.target as HTMLInputElement;
  let valor = input.value;
  if (this.tipoRequiereNumeros()) {
    valor = valor.replace(/\D/g, '');
  } else {
    valor = valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }
  valor = valor.slice(0, this.maxLongitudDocumento());
  this.form.numeroDocumento = valor;
  input.value = valor;
  this.limpiarErrorCredenciales();
}

  documentoValido(): boolean {
    const regla = this.reglaDocumentoActual();
    const len = this.form.numeroDocumento.trim().length;
    return len >= regla.longitudMin && len <= regla.longitudMax;
  }

  errorNumeroDocumento(): string | null {
    return this.documentoValido() ? null : this.reglaDocumentoActual().mensaje;
  }

  // ============ Email ============

  emailValido(): boolean {
    if (!this.form.email.trim()) return true; // opcional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim());
  }

  // ============ Medidor de fuerza de contraseña ============

  private calcularFuerza(p: string): number {
    let puntos = 0;
    if (p.length >= 6) puntos++;
    if (p.length >= 10) puntos++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) puntos++;
    if (/[^A-Za-z0-9]/.test(p)) puntos++;
    return puntos;
  }

  fuerzaPassword(): number {
    return this.calcularFuerza(this.form.password ?? '');
  }

  etiquetaFuerza(): string {
    return ETIQUETAS_FUERZA[this.fuerzaPassword()];
  }

  fuerzaPasswordRecuperacion(): number {
    return this.calcularFuerza(this.formRecuperacion.nuevaPassword ?? '');
  }

  etiquetaFuerzaRecuperacion(): string {
    return ETIQUETAS_FUERZA[this.fuerzaPasswordRecuperacion()];
  }

  confirmarPasswordValido(): boolean {
    return this.form.confirmarPassword === this.form.password;
  }

  // ============ Validación general ============

  formularioValido(): boolean {
    if (!this.documentoValido() || !this.form.password) return false;

    if (this.modo === 'registro') {
      return (
        this.form.nombreRazonSocial.trim().length > 0 &&
        this.form.password.length >= 6 &&
        this.confirmarPasswordValido() &&
        this.emailValido() &&
        this.form.aceptaTerminos
      );
    }
    return true;
  }



  // ============ Login / Registro ============

  enviar(): void {
    this.documentoTocado = true;
    this.emailTocado = true;
    if (!this.formularioValido()) return;

    this.enviando = true;

    const accion = this.modo === 'login'
      ? this.clienteAuthService.login({
          tipoDocumento: this.form.tipoDocumento,
          numeroDocumento: this.form.numeroDocumento,
          password: this.form.password
        })
      : this.clienteAuthService.registrar({
          tipoDocumento: this.form.tipoDocumento,
          numeroDocumento: this.form.numeroDocumento,
          nombreRazonSocial: this.form.nombreRazonSocial,
          telefono: this.form.telefono,
          email: this.form.email || undefined,
          password: this.form.password
        });

    accion.subscribe({
      next: () => {
        this.enviando = false;
        this.enviadoExitoso = true;
        setTimeout(() => this.router.navigateByUrl('/'), 650);
      },
      error: err => {
  this.enviando = false;

  if (this.modo === 'login') {
    this.credencialesInvalidas = true;
    this.mensajeErrorCredenciales = err?.error?.mensaje ?? 'El documento o la contraseña son incorrectos. Inténtalo de nuevo.';
  }

 /* this.messageService.add({
    severity: 'error',
    summary: this.modo === 'login' ? 'No se pudo iniciar sesión' : 'No se pudo crear la cuenta',
    detail: err?.error?.mensaje ?? 'Revisa tus datos e intenta de nuevo.',
    life: 4000
  });*/
}
    });
  }

  limpiarErrorCredenciales(): void {
  if (this.credencialesInvalidas) {
    this.credencialesInvalidas = false;
    this.mensajeErrorCredenciales = '';
  }
}

  // ============ Olvidé mi contraseña ============

  irAOlvidePassword(): void {
    this.formRecuperacion = { email: '', codigo: '', nuevaPassword: '', confirmarPassword: '' };
    this.modo = 'olvide';
  }

volverALogin(): void {
  this.detenerTemporizadorReenvio();
  this.enviadoExitoso = false;
  this.modo = 'login';
  setTimeout(() => this.renderizarBotonGoogle());
}

  enviarCodigoRecuperacion(): void {
    if (!this.formRecuperacion.email.trim()) return;

    this.enviandoRecuperacion = true;
    this.clienteAuthService.olvidePassword(this.formRecuperacion.email.trim()).subscribe({
      next: () => {
        this.enviandoRecuperacion = false;
        this.modo = 'restablecer';
        this.iniciarTemporizadorReenvio();
        this.messageService.add({
          severity: 'success',
          summary: 'Revisa tu correo',
          detail: 'Si tu correo está registrado, te llegó un código de 6 caracteres. Puede tardar unos minutos.',
          life: 6000
        });
      },
      error: () => {
        this.enviandoRecuperacion = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo procesar la solicitud',
          detail: 'Intenta nuevamente en unos momentos.',
          life: 4000
        });
      }
    });
  }

  reenviarCodigo(): void {
    if (this.segundosParaReenvio > 0) return;
    this.enviarCodigoRecuperacion();
  }

  confirmarNuevaPassword(): void {
    if (this.formRecuperacion.nuevaPassword.length < 6) {
      this.messageService.add({ severity: 'warn', summary: 'Contraseña muy corta', detail: 'Debe tener al menos 6 caracteres.', life: 3500 });
      return;
    }

    if (this.formRecuperacion.nuevaPassword !== this.formRecuperacion.confirmarPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Las contraseñas no coinciden', life: 3500 });
      return;
    }

    this.enviandoRecuperacion = true;
    this.clienteAuthService.restablecerPassword(this.formRecuperacion.codigo.trim(), this.formRecuperacion.nuevaPassword).subscribe({
      next: () => {
        this.enviandoRecuperacion = false;
        this.enviadoExitoso = true;
        this.detenerTemporizadorReenvio();
        this.messageService.add({ severity: 'success', summary: 'Contraseña actualizada', detail: 'Ya puedes ingresar con tu nueva contraseña.', life: 4500 });
        this.form.password = '';
        setTimeout(() => {
  this.enviadoExitoso = false;
  this.modo = 'login';
  setTimeout(() => this.renderizarBotonGoogle());
}, 650);
      },
      error: err => {
        this.enviandoRecuperacion = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo cambiar la contraseña',
          detail: err?.error?.mensaje ?? 'Verifica el código e intenta de nuevo.',
          life: 4500
        });
      }
    });
  }

  private iniciarTemporizadorReenvio(): void {
    this.detenerTemporizadorReenvio();
    this.segundosParaReenvio = SEGUNDOS_ESPERA_REENVIO;
    this.temporizadorReenvio = setInterval(() => {
      this.segundosParaReenvio--;
      if (this.segundosParaReenvio <= 0) {
        this.detenerTemporizadorReenvio();
      }
    }, 1000);
  }

  private detenerTemporizadorReenvio(): void {
    if (this.temporizadorReenvio) {
      clearInterval(this.temporizadorReenvio);
      this.temporizadorReenvio = undefined;
    }
    this.segundosParaReenvio = 0;
  }

  ngOnDestroy(): void {
    this.detenerTemporizadorReenvio();
  }

  // ============ Google ============

ngAfterViewInit(): void {
  if (typeof google === 'undefined') return;

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (respuesta: { credential: string }) => this.manejarCredencialGoogle(respuesta.credential)
  });

  this.renderizarBotonGoogle();
}

private renderizarBotonGoogle(): void {
  if (typeof google === 'undefined') return;
  const contenedor = document.getElementById('boton-google');
  if (!contenedor) return;

  google.accounts.id.renderButton(
    contenedor,
    { 
      theme: 'outline', 
      size: 'large', 
      width: 360,          
      shape: 'pill',       
      text: 'continue_with', 
      locale: 'es' 
    }
  );
}

  private manejarCredencialGoogle(idToken: string): void {
    this.enviando = true;
    this.clienteAuthService.loginConGoogle(idToken).subscribe({
      next: () => {
        this.enviando = false;
        this.enviadoExitoso = true;
        setTimeout(() => this.router.navigateByUrl('/'), 650);
      },
      error: err => {
        this.enviando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo iniciar sesión con Google',
          detail: err?.error?.mensaje ?? 'Intenta nuevamente.',
          life: 4000
        });
      }
    });
  }
}