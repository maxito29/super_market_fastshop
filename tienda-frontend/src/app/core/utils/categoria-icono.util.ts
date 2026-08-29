export type TipoIconoCategoria =
  | 'frutas'
  | 'carnes'
  | 'desayunos'
  | 'lacteos'
  | 'quesos'
  | 'panaderia'
  | 'comidas-preparadas'
  | 'bebidas'
  | 'snacks'
  | 'limpieza'
  | 'cuidado-personal'
  | 'bebes'
  | 'mascotas'
  | 'congelados'
  | 'abarrotes'
  | 'general';

interface ReglaIcono {
  tipo: TipoIconoCategoria;
  palabrasClave: string[];
}

const REGLAS: ReglaIcono[] = [
  { tipo: 'comidas-preparadas', palabrasClave: ['rostizado', 'preparad', 'comida lista', 'rotisser'] },
  { tipo: 'panaderia', palabrasClave: ['panader', 'pasteler', 'reposter'] },
  { tipo: 'desayunos', palabrasClave: ['desayuno', 'cafe', 'café', 'cereal'] },
  { tipo: 'lacteos', palabrasClave: ['lacte', 'lácte', 'leche', 'huevo', 'yogur'] },
  { tipo: 'quesos', palabrasClave: ['queso', 'fiambre', 'embutido'] },
  { tipo: 'congelados', palabrasClave: ['congelad', 'helado'] },
  { tipo: 'bebidas', palabrasClave: ['bebida', 'gaseosa', 'jugo', 'agua', 'cerveza', 'vino', 'licor'] },
  { tipo: 'snacks', palabrasClave: ['snack', 'golosina', 'dulce', 'chocolate', 'galleta', 'piquete'] },
  { tipo: 'limpieza', palabrasClave: ['limpieza', 'hogar', 'detergente'] },
  { tipo: 'cuidado-personal', palabrasClave: ['cuidado personal', 'higiene', 'cosmetic', 'cosmétic', 'belleza'] },
  { tipo: 'bebes', palabrasClave: ['bebé', 'bebe', 'pañal', 'infantil'] },
  { tipo: 'mascotas', palabrasClave: ['mascota', 'perro', 'gato'] },
  { tipo: 'frutas', palabrasClave: ['fruta', 'verdura', 'vegetal'] },
  { tipo: 'carnes', palabrasClave: ['carne', 'ave', 'pescado', 'res ', 'pollo', 'cerdo', 'pavita', 'marisco'] },
  { tipo: 'abarrotes', palabrasClave: ['abarrote', 'grano', 'arroz', 'aceite', 'condimento', 'conserva'] }
];


export function obtenerTipoIconoCategoria(nombreCategoria: string): TipoIconoCategoria {
  const nombre = (nombreCategoria || '').toLowerCase();

  for (const regla of REGLAS) {
    if (regla.palabrasClave.some(palabra => nombre.includes(palabra))) {
      return regla.tipo;
    }
  }

  return 'general';
}