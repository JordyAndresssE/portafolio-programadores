import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, docData, query, where, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Usuario } from '../modelos/usuario.modelo';

@Injectable({
  providedIn: 'root'
})
export class UsuariosServicio {
  private firestore: Firestore = inject(Firestore);

  obtenerTodosLosUsuarios(): Observable<Usuario[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    return collectionData(usuariosRef, { idField: 'uid' }) as Observable<Usuario[]>;
  }

  async obtenerProgramadores(): Promise<Usuario[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('rol', '==', 'programador'));
    const querySnapshot = await getDocs(q);

    const programadores: Usuario[] = [];
    querySnapshot.forEach((doc) => {
      programadores.push({ uid: doc.id, ...doc.data() } as Usuario);
    });

    return programadores;
  }

  obtenerUsuarioPorId(uid: string): Observable<Usuario | undefined> {
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    return docData(userDocRef, { idField: 'uid' }) as Observable<Usuario>;
  }

  async actualizarUsuario(usuario: Usuario): Promise<void> {
    const userDocRef = doc(this.firestore, `usuarios/${usuario.uid}`);
    // Eliminamos el campo uid del objeto a guardar para no duplicarlo dentro del documento si no es necesario, 
    // aunque Firestore lo maneja bien. Lo importante es pasar los datos a actualizar.
    const { uid, ...datosActualizar } = usuario;
    await updateDoc(userDocRef, datosActualizar);
  }
}

