import { Routes } from '@angular/router';
import { InicioSesionComponent } from './autenticacion/inicio-sesion/inicio-sesion.component';
import { AdminDashboardComponent } from './administrador/admin-dashboard.component';
import { PanelProgramadorComponent } from './programador/panel-programador.component';
import { PanelUsuarioComponent } from './publico/panel-usuario/panel-usuario.component';
import { InicioComponent } from './publico/inicio/inicio.component';
import { PerfilPublicoComponent } from './publico/perfil-publico/perfil-publico.component';
import { authGuard } from './guardias/auth.guard';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'perfil/:id', component: PerfilPublicoComponent },
  { path: 'login', component: InicioSesionComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['administrador'] }
  },
  {
    path: 'programador',
    component: PanelProgramadorComponent,
    canActivate: [authGuard],
    data: { roles: ['programador'] }
  },
  {
    path: 'usuario',
    component: PanelUsuarioComponent,
    canActivate: [authGuard],
    data: { roles: ['usuario'] }
  },
];

