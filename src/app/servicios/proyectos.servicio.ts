import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, collectionData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Proyecto } from '../modelos/proyecto.modelo';
import { AutenticacionServicio } from './autenticacion.servicio';

@Injectable({
  providedIn: 'root'
})
export class ProyectosServicio {
  private firestore = inject(Firestore);
  private authService = inject(AutenticacionServicio);

  obtenerMisProyectos(): Observable<Proyecto[]> {
    return this.authService.usuario$.pipe(
      switchMap(usuario => {
        if (!usuario) return of([]);
        const proyectosRef = collection(this.firestore, 'proyectos');
        const q = query(proyectosRef, where('idProgramador', '==', usuario.uid));
        return collectionData(q, { idField: 'id' }) as Observable<Proyecto[]>;
      })
    );
  }

  obtenerProyectosPorProgramador(idProgramador: string): Observable<Proyecto[]> {
    const proyectosRef = collection(this.firestore, 'proyectos');
    const q = query(proyectosRef, where('idProgramador', '==', idProgramador));
    return collectionData(q, { idField: 'id' }) as Observable<Proyecto[]>;
  }

  async crearProyecto(proyecto: Proyecto) {
    const proyectosRef = collection(this.firestore, 'proyectos');
    return addDoc(proyectosRef, proyecto);
  }

  async actualizarProyecto(proyecto: Proyecto) {
    if (!proyecto.id) return;
    const docRef = doc(this.firestore, `proyectos/${proyecto.id}`);
    const { id, ...data } = proyecto;
    return updateDoc(docRef, data);
  }

  async eliminarProyecto(id: string) {
    const docRef = doc(this.firestore, `proyectos/${id}`);
    return deleteDoc(docRef);
  }
}
