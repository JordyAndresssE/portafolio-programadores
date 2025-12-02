import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionServicio, Notificacion } from '../../servicios/notificacion.servicio';

@Component({
  selector: 'app-notificacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notificacion" class="notificacion" [class]="notificacion.tipo">
      <div class="notificacion-content">
        <div class="icon">
          <svg *ngIf="notificacion.tipo === 'exito'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <svg *ngIf="notificacion.tipo === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <svg *ngIf="notificacion.tipo === 'advertencia'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <svg *ngIf="notificacion.tipo === 'info'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <span class="mensaje">{{ notificacion.mensaje }}</span>
        <button class="close-btn" (click)="cerrar()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notificacion {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 9999;
      min-width: 350px;
      max-width: 500px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      animation: slideInRight 0.4s ease;
      
      &.exito {
        background: #d4f4dd;
        color: #25855a;
      }
      
      &.error {
        background: #fed7d7;
        color: #c53030;
      }
      
      &.advertencia {
        background: #feebc8;
        color: #c05621;
      }
      
      &.info {
        background: #bee3f8;
        color: #2c5282;
      }
    }

    .notificacion-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
    }

    .icon {
      flex-shrink: 0;
      
      svg {
        width: 24px;
        height: 24px;
      }
    }

    .mensaje {
      flex: 1;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .close-btn {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      opacity: 0.7;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 1;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 768px) {
      .notificacion {
        top: 1rem;
        right: 1rem;
        left: 1rem;
        min-width: auto;
      }
    }
  `]
})
export class NotificacionComponent implements OnInit {
  notificacion: Notificacion | null = null;
  private timeoutId: any;
  private notificacionService = inject(NotificacionServicio);

  ngOnInit() {
    this.notificacionService.notificacion$.subscribe(notif => {
      this.notificacion = notif;
      
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      this.timeoutId = setTimeout(() => {
        this.cerrar();
      }, notif.duracion || 3000);
    });
  }

  cerrar() {
    this.notificacion = null;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
