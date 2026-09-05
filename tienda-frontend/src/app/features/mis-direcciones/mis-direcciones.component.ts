import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, Subscription, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import * as L from 'leaflet';

import { ClienteService } from '../../core/services/cliente.service';
import { UbicacionService } from '../../core/services/ubicacion.service';
import { DireccionCliente } from '../../core/models/direccion.models';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const CENTRO_LIMA: L.LatLngTuple = [-12.0464, -77.0428];

@Component({
  selector: 'app-mis-direcciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mis-direcciones.component.html',
  styleUrl: './mis-direcciones.component.scss'
})
export class MisDireccionesComponent implements OnInit, OnDestroy {

  @ViewChild('mapaContenedor') mapaContenedor?: ElementRef<HTMLDivElement>;

  cargando = true;
  guardando = false;
  mostrarFormulario = false;
  editandoId: number | null = null;
  buscandoUbicacion = false;
  direcciones: DireccionCliente[] = [];

  readonly distritosSugeridos = [
    'San Miguel', 'Surco', 'Miraflores', 'San Isidro', 'La Molina', 'San Borja',
    'Jesús María', 'Lince', 'Magdalena del Mar', 'Pueblo Libre', 'Barranco',
    'Chorrillos', 'Surquillo', 'Breña', 'Cercado de Lima', 'San Juan de Miraflores',
    'Villa El Salvador', 'Los Olivos', 'San Martín de Porres', 'Independencia',
    'Comas', 'Ate', 'Santa Anita', 'La Victoria', 'El Agustino', 'Rímac', 'Callao'
  ];

  form = { direccion: '', distrito: '', referencia: '', predeterminada: false };

  private mapa?: L.Map;
  private marcador?: L.Marker;
  private circuloPrecision?: L.Circle;
  private cambiosDireccion = new Subject<string>();
  private subCambiosDireccion?: Subscription;

  constructor(
    private clienteService: ClienteService,
    private ubicacionService: UbicacionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargar();

    // Mientras el cliente escribe, buscamos la dirección en el mapa (con espera de 700ms)
    this.subCambiosDireccion = this.cambiosDireccion.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      filter(texto => texto.trim().length > 4),
      switchMap(texto => this.ubicacionService.geocodificarDireccion(texto, this.form.distrito))
    ).subscribe(resultado => {
      if (resultado) {
        this.moverMarcador(resultado.lat, resultado.lon, true);
      }
    });
  }

  ngOnDestroy(): void {
    this.subCambiosDireccion?.unsubscribe();
    this.mapa?.remove();
  }

  cargar(): void {
    this.cargando = true;
    this.clienteService.listarDirecciones().subscribe({
      next: direcciones => { this.cargando = false; this.direcciones = direcciones; },
      error: () => { this.cargando = false; }
    });
  }

  nuevaDireccion(): void {
    this.editandoId = null;
    this.form = { direccion: '', distrito: '', referencia: '', predeterminada: this.direcciones.length === 0 };
    this.abrirFormulario();
  }

  editar(d: DireccionCliente): void {
    this.editandoId = d.id;
    this.form = { direccion: d.direccion, distrito: d.distrito, referencia: d.referencia ?? '', predeterminada: d.predeterminada };
    this.abrirFormulario();
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.mapa?.remove();
    this.mapa = undefined;
  }

  usarUbicacionActual(): void {
    this.buscandoUbicacion = true;

    this.ubicacionService.obtenerUbicacionActual()
      .then(posicion => {
        const lat = posicion.coords.latitude;
        const lon = posicion.coords.longitude;
        const precision = posicion.coords.accuracy; // metros

        this.moverMarcador(lat, lon, true);
        this.mostrarPrecision(lat, lon, precision);
        this.rellenarDesdeCoordenadas(lat, lon);

        if (precision > 1000) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Ubicación aproximada',
            detail: `Tu navegador solo pudo calcular tu posición con ~${Math.round(precision / 1000)} km de margen (típico en computadoras de escritorio, sin GPS). Ajusta el marcador manualmente si no cayó en el punto correcto.`,
            life: 7000
          });
        }
      })
      .catch(() => {
        this.buscandoUbicacion = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'No pudimos acceder a tu ubicación',
          detail: 'Revisa los permisos de ubicación de tu navegador, o marca el punto directamente en el mapa.',
          life: 4500
        });
      });
  }

  alEscribirDireccion(texto: string): void {
    this.cambiosDireccion.next(texto);
  }

  alPresionarEnterEnDireccion(evento: Event): void {
    evento.preventDefault(); // evita que Enter dispare el submit del formulario
    this.ubicacionService.geocodificarDireccion(this.form.direccion, this.form.distrito).subscribe(resultado => {
      if (resultado) {
        this.moverMarcador(resultado.lat, resultado.lon, true);
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'No encontramos esa dirección en el mapa',
          detail: 'Puedes ajustar el punto manualmente arrastrando el marcador.',
          life: 4000
        });
      }
    });
  }

  guardar(): void {
    this.guardando = true;
    const accion = this.editandoId
      ? this.clienteService.actualizarDireccion(this.editandoId, this.form)
      : this.clienteService.crearDireccion(this.form);

    accion.subscribe({
      next: () => {
        this.guardando = false;
        this.cancelar();
        this.messageService.add({ severity: 'success', summary: 'Dirección guardada', life: 3000 });
        this.cargar();
      },
      error: err => {
        this.guardando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo guardar la dirección',
          detail: err?.error?.mensaje ?? 'Intenta nuevamente.',
          life: 4000
        });
      }
    });
  }

  eliminar(d: DireccionCliente): void {
    this.clienteService.eliminarDireccion(d.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Dirección eliminada', life: 3000 });
        this.cargar();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'No se pudo eliminar', life: 3000 });
      }
    });
  }

  private abrirFormulario(): void {
    this.mostrarFormulario = true;
    setTimeout(() => this.inicializarMapa(), 0);
  }

  private inicializarMapa(): void {
    if (!this.mapaContenedor) return;

    this.mapa = L.map(this.mapaContenedor.nativeElement).setView(CENTRO_LIMA, 14);

    // CartoDB Voyager: cartografía moderna sobre datos de OpenStreetMap, gratis y sin API key
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.mapa);

    this.marcador = L.marker(CENTRO_LIMA, { draggable: true }).addTo(this.mapa);

    this.marcador.on('dragend', () => {
      const posicion = this.marcador!.getLatLng();
      this.rellenarDesdeCoordenadas(posicion.lat, posicion.lng);
    });

    this.mapa.on('click', (evento: L.LeafletMouseEvent) => {
      this.moverMarcador(evento.latlng.lat, evento.latlng.lng, false);
      this.rellenarDesdeCoordenadas(evento.latlng.lat, evento.latlng.lng);
    });
  }

  private moverMarcador(lat: number, lon: number, centrarMapa: boolean): void {
    if (!this.mapa || !this.marcador) return;
    this.marcador.setLatLng([lat, lon]);
    this.circuloPrecision?.remove();
    this.circuloPrecision = undefined;
    if (centrarMapa) {
      this.mapa.setView([lat, lon], 16);
    }
  }

  private mostrarPrecision(lat: number, lon: number, radioMetros: number): void {
    if (!this.mapa) return;
    this.circuloPrecision?.remove();
    this.circuloPrecision = L.circle([lat, lon], {
      radius: radioMetros,
      color: '#2e8b63',
      fillColor: '#2e8b63',
      fillOpacity: 0.12,
      weight: 1
    }).addTo(this.mapa);
  }

  private rellenarDesdeCoordenadas(lat: number, lon: number): void {
    this.ubicacionService.geocodificarInversa(lat, lon).subscribe({
      next: resultado => {
        this.buscandoUbicacion = false;
        if (resultado.direccionCompleta) this.form.direccion = resultado.direccionCompleta;
        if (resultado.distritoSugerido) this.form.distrito = resultado.distritoSugerido;
      },
      error: () => {
        this.buscandoUbicacion = false;
        this.messageService.add({ severity: 'warn', summary: 'No pudimos identificar la dirección exacta', detail: 'Puedes escribirla manualmente.', life: 4000 });
      }
    });
  }
}