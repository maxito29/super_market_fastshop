import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { CatalogoFiltroService } from '../../../core/services/catalogo-filtro.service';
import { MenuLateralService } from '../../../core/services/menu-lateral.service';
import { Categoria } from '../../../core/models/catalogo.models';
import { CategoriaIconoComponent } from '../../categoria-icono/categoria-icono.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, CategoriaIconoComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  categorias: Categoria[] = [];

  constructor(
    private catalogoService: CatalogoService,
    public filtro: CatalogoFiltroService,
    public menu: MenuLateralService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.catalogoService.listarCategorias().subscribe(categorias => (this.categorias = categorias));
  }

irACategoria(id: number | null): void {
  this.menu.cerrar();
  if (id === null) {
    this.filtro.seleccionar(null);
    this.router.navigate(['/']);
  } else {
    this.router.navigate(['/categoria', id]);
  }
}

  cerrar(): void {
    this.menu.cerrar();
  }
}