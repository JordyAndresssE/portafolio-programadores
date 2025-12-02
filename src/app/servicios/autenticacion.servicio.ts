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

  constructor() {
    this.usuario$ = authState(this.auth).pipe(
      switchMap((user: FirebaseUser | null) => {
        if (user) {
          const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
          // Usamos onSnapshot manual para evitar errores de contexto de inyección con docData
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

  async iniciarSesionGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const credencial = await signInWithPopup(this.auth, provider);
      const user = credencial.user;
      
      // Ejecutamos la lógica de base de datos dentro del contexto de inyección para evitar errores de AngularFire
      runInInjectionContext(this.injector, async () => {
        // Verificar si el usuario ya existe en Firestore
        const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
        const userDoc = await getDoc(userDocRef);

        let datosUsuario: Usuario;

        if (!userDoc.exists()) {
          // Si es la primera vez, lo registramos. 
          const nuevoUsuario: Usuario = {
            uid: user.uid,
            email: user.email || '',
            nombre: user.displayName || 'Usuario',
            fotoPerfil: user.photoURL || '',
            rol: 'programador' 
          };
          await setDoc(userDocRef, nuevoUsuario);
          datosUsuario = nuevoUsuario;
        } else {
          datosUsuario = userDoc.data() as Usuario;
        }
        
        // Redirigir usando los datos obtenidos directamente
        console.log('Usuario autenticado:', datosUsuario);
        this.redirigirSegunRol(datosUsuario);
      });

    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  }

  async cerrarSesion() {
    await signOut(this.auth);
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
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
        case 'usuario': // AHORA: 'usuario' también va al panel de programador
          this.router.navigate(['/programador']);
          break;
        default:
          this.router.navigate(['/login']);
          break;
      }
    });
  }
}
