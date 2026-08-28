import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { CatalogoFiltroService } from '../../../core/services/catalogo-filtro.service';
import { MenuLateralService } from '../../../core/services/menu-lateral.service';
import { Categoria } from '../../../core/models/catalogo.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
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
    this.filtro.seleccionar(id);
    this.router.navigate(['/']);
    this.menu.cerrar();
  }

  cerrar(): void {
    this.menu.cerrar();
  }
}