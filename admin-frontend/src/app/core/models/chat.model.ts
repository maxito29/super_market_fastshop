export interface ChatMensaje {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  pregunta: string;
  historial: ChatMensaje[];
}

export interface ChatResponse {
  respuesta: string;
}