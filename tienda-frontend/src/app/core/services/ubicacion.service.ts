import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ResultadoGeocodificacion {
  direccionCompleta: string;
  distritoSugerido: string;
}

@Injectable({ providedIn: 'root' })
export class UbicacionService {

  constructor(private http: HttpClient) {}

  obtenerUbicacionActual(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Tu navegador no soporta geolocalización'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    });
  }

  geocodificarInversa(lat: number, lon: number): Observable<ResultadoGeocodificacion> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=es`;
    return this.http.get<any>(url).pipe(
      map(resultado => {
        const a = resultado.address ?? {};
        const calle = [a.road, a.house_number].filter(Boolean).join(' ');
        const distrito = a.suburb || a.city_district || a.town || a.city || '';
        return {
          direccionCompleta: calle || resultado.display_name || '',
          distritoSugerido: distrito
        };
      })
    );
  }

  geocodificarDireccion(texto: string, distrito?: string): Observable<{ lat: number; lon: number; direccionCompleta: string } | null> {
  const consulta = [texto, distrito, 'Lima, Perú'].filter(Boolean).join(', ');
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(consulta)}&countrycodes=pe&addressdetails=1&limit=1`;

  return this.http.get<any[]>(url).pipe(
    map(resultados => {
      if (!resultados.length) return null;
      const r = resultados[0];
      return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), direccionCompleta: r.display_name };
    })
  );
}
}