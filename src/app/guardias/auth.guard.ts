import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacionServicio);
  const router = inject(Router);

  return authService.usuario$.pipe(
    take(1),
    map(user => {
      if (user) {
        // Verificar roles si es necesario
        const rolesPermitidos = route.data?.['roles'] as Array<string>;
        if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
          // Si el usuario no tiene el rol adecuado, redirigir a su home o login
          return router.createUrlTree(['/login']);
        }
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  );
};
