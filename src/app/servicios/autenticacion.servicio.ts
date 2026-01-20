import { Injectable, inject, NgZone } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, authState, User as FirebaseUser } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Usuario } from '../modelos/usuario.modelo';
import { UsuariosBackendServicio } from './usuarios-backend.servicio';
import { convertirUsuario } from '../utils/convertidores';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionServicio {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  private ngZone: NgZone = inject(NgZone);
  private usuariosBackend = inject(UsuariosBackendServicio);

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$: Observable<Usuario | null> = this.usuarioSubject.asObservable();

  private usuarioPendiente: FirebaseUser | null = null;

  constructor() {
    // Escuchar cambios de autenticación de Firebase
    authState(this.auth).subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado en Firebase, buscar en backend
        await this.cargarUsuarioDesdeBackend(firebaseUser.uid);
      } else {
        // Usuario no autenticado
        this.usuarioSubject.next(null);
      }
    });
  }

  private async cargarUsuarioDesdeBackend(uid: string): Promise<void> {
    try {
      this.usuariosBackend.obtenerUsuarioPorId(uid).subscribe({
        next: (usuario) => {
          if (usuario) {
            // Convertir tecnologias usando helper
            this.usuarioSubject.next(convertirUsuario(usuario));
          } else {
            this.usuarioSubject.next(null);
          }
        },
        error: (error) => {
          console.error('Error al cargar usuario desde backend:', error);
          this.usuarioSubject.next(null);
        }
      });
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      this.usuarioSubject.next(null);
    }
  }

  async iniciarSesionGoogle(): Promise<boolean> {
    const provider = new GoogleAuthProvider();
    try {
      const credencial = await signInWithPopup(this.auth, provider);
      const firebaseUser = credencial.user;

      // Verificar si el usuario existe en el backend
      return new Promise((resolve) => {
        this.usuariosBackend.obtenerUsuarioPorId(firebaseUser.uid).subscribe({
          next: async (usuarioBackend) => {
            if (!usuarioBackend) {
              // Usuario nuevo - crear en backend
              this.crearNuevoUsuario(firebaseUser, resolve);
            } else {
              // Usuario existente - redirigir según rol
              console.log('✅ Usuario existente autenticado:', usuarioBackend);
              this.usuarioSubject.next(convertirUsuario(usuarioBackend));
              this.redirigirSegunRol(usuarioBackend);
              resolve(false);
            }
          },
          error: (error) => {
            // Si es 404, significa que el usuario no existe - crearlo
            if (error.status === 404) {
              console.log('📝 Usuario no encontrado, creando nuevo usuario...');
              this.crearNuevoUsuario(firebaseUser, resolve);
            } else {
              console.error('❌ Error al verificar usuario:', error);
              resolve(false);
            }
          }
        });
      });

    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  async establecerRolYRedirigir(rol: 'programador' | 'usuario'): Promise<void> {
    // Este método ya no es necesario porque creamos usuarios automáticamente
    console.warn('establecerRolYRedirigir ya no se usa - usuarios se crean automáticamente');
  }

  async cerrarSesion() {
    await signOut(this.auth);
    this.usuarioSubject.next(null);
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  async obtenerUsuarioActual(): Promise<Usuario | null> {
    return this.usuarioSubject.value;
  }

  private crearNuevoUsuario(firebaseUser: any, resolve: (value: boolean) => void) {
    const nuevoUsuario: Usuario = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      nombre: firebaseUser.displayName || 'Usuario',
      fotoPerfil: firebaseUser.photoURL || '',
      rol: 'usuario'
    };

    this.usuariosBackend.crearUsuario(nuevoUsuario).subscribe({
      next: (usuarioCreado) => {
        console.log('✅ Nuevo usuario creado en backend:', usuarioCreado);
        this.usuarioSubject.next(nuevoUsuario);
        this.redirigirSegunRol(nuevoUsuario);
        resolve(true);
      },
      error: (error) => {
        console.error('❌ Error al crear usuario en backend:', error);
        // Aún así redirigir como usuario temporal
        this.usuarioSubject.next(nuevoUsuario);
        this.redirigirSegunRol(nuevoUsuario);
        resolve(false);
      }
    });
  }

  private redirigirSegunRol(usuario: Usuario | null) {
    if (!usuario) return;

    this.ngZone.run(() => {
      switch (usuario.rol) {
        case 'administrador':
          this.router.navigate(['/admin']);
          break;
        case 'programador':
          this.router.navigate(['/programador']);
          break;
        case 'usuario':
          this.router.navigate(['/usuario']);
          break;
        default:
          this.router.navigate(['/login']);
          break;
      }
    });
  }
}
