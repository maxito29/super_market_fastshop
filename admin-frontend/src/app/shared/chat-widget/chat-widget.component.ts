import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { ChatMensaje } from '../../core/models/chat.model';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss'
})
export class ChatWidgetComponent implements AfterViewChecked {

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  abierto = signal(false);
  cargando = signal(false);
  pregunta = '';

  mensajes = signal<ChatMensaje[]>([
    { role: 'assistant', content: 'Hola 👋 Soy tu asistente. Pregúntame sobre productos, stock o trabajadores.' }
  ]);

  private debeHacerScroll = false;

  constructor(private chatService: ChatService) {}

  ngAfterViewChecked(): void {
    if (this.debeHacerScroll) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      this.debeHacerScroll = false;
    }
  }

  toggle(): void {
    this.abierto.update(v => !v);
  }

  enviar(): void {
    const texto = this.pregunta.trim();
    if (!texto || this.cargando()) return;

    const historialPrevio = this.mensajes();
    this.mensajes.update(m => [...m, { role: 'user', content: texto }]);
    this.pregunta = '';
    this.cargando.set(true);
    this.debeHacerScroll = true;

    this.chatService.preguntar({ pregunta: texto, historial: historialPrevio }).subscribe({
      next: (res) => {
        this.mensajes.update(m => [...m, { role: 'assistant', content: res.respuesta }]);
        this.cargando.set(false);
        this.debeHacerScroll = true;
      },
      error: () => {
        this.mensajes.update(m => [...m, { role: 'assistant', content: 'Ocurrió un error, intenta de nuevo.' }]);
        this.cargando.set(false);
        this.debeHacerScroll = true;
      }
    });
  }
}