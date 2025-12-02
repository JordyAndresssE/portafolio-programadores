import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacionComponent } from './compartido/notificacion/notificacion.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificacionComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('portafolio-programadores');
}
