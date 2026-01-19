import { Injectable, inject, NgZone, Injector, runInInjectionContext } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, authState, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, onSnapshot } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Usuario } from '../modelos/usuario.modelo';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionServicio {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  private ngZone: NgZone = inject(NgZone);
  private injector: Injector = inject(Injector);

  usuario$: Observable<Usuario | null>;
  private usuarioPendiente: FirebaseUser | null = null;

  constructor() {
    this.usuario$ = authState(this.auth).pipe(
      switchMap((user: FirebaseUser | null) => {
        if (user) {
          const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
          return new Observable<Usuario>(observer => {
            const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
              if (snapshot.exists()) {
                observer.next({ uid: snapshot.id, ...snapshot.data() } as Usuario);
              } else {
                // Si el documento no existe aún (puede pasar en el registro inicial)
                observer.next({
                  uid: user.uid,
                  email: user.email || '',
                  nombre: user.displayName || 'Usuario',
                  fotoPerfil: user.photoURL || '',
                  rol: 'usuario'
                });
              }
            }, (error) => {
              observer.error(error);
            });
            return () => unsubscribe();
          });
        } else {
          return of(null);
        }
      })
    );
  }

  async iniciarSesionGoogle(): Promise<boolean> {
    const provider = new GoogleAuthProvider();
    try {
      const credencial = await signInWithPopup(this.auth, provider);
      const user = credencial.user;

      // Ejecutamos la lógica de base de datos dentro del contexto de inyección para evitar errores de AngularFire
      return await runInInjectionContext(this.injector, async () => {
        // Verificar si el usuario ya existe en Firestore
        const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // Es un nuevo usuario, guardar temporalmente para asignar rol después
          this.usuarioPendiente = user;
          return true; // Es nuevo usuario
        } else {
          // Usuario existente, redirigir según su rol
          const datosUsuario = userDoc.data() as Usuario;
          console.log('Usuario existente autenticado:', datosUsuario);
          this.redirigirSegunRol(datosUsuario);
          return false; // No es nuevo usuario
        }
      });

    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  async establecerRolYRedirigir(rol: 'programador' | 'usuario'): Promise<void> {
    if (!this.usuarioPendiente) {
      console.error('No hay usuario pendiente para establecer rol');
      return;
    }

    const user = this.usuarioPendiente;

    await runInInjectionContext(this.injector, async () => {
      const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);

      const nuevoUsuario: Usuario = {
        uid: user.uid,
        email: user.email || '',
        nombre: user.displayName || 'Usuario',
        fotoPerfil: user.photoURL || '',
        rol: rol
      };

      await setDoc(userDocRef, nuevoUsuario);
      console.log('Nuevo usuario registrado con rol:', rol);

      this.usuarioPendiente = null;
      this.redirigirSegunRol(nuevoUsuario);
    });
  }

  async cerrarSesion() {
    await signOut(this.auth);
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  async obtenerUsuarioActual(): Promise<FirebaseUser | null> {
    return this.auth.currentUser;
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
