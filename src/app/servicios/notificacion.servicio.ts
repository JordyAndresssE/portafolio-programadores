import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notificacion {
  mensaje: string;
  tipo: 'exito' | 'error' | 'advertencia' | 'info';
  duracion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionServicio {
  private notificacionSubject = new Subject<Notificacion>();
  notificacion$ = this.notificacionSubject.asObservable();

  mostrarExito(mensaje: string, duracion: number = 3000) {
    this.notificacionSubject.next({ mensaje, tipo: 'exito', duracion });
  }

  mostrarError(mensaje: string, duracion: number = 4000) {
    this.notificacionSubject.next({ mensaje, tipo: 'error', duracion });
  }

  mostrarAdvertencia(mensaje: string, duracion: number = 3500) {
    this.notificacionSubject.next({ mensaje, tipo: 'advertencia', duracion });
  }

  mostrarInfo(mensaje: string, duracion: number = 3000) {
    this.notificacionSubject.next({ mensaje, tipo: 'info', duracion });
  }
}
