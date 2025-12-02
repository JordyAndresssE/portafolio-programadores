import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, doc, updateDoc, orderBy } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Asesoria } from '../modelos/asesoria.modelo';

@Injectable({
  providedIn: 'root'
})
export class AsesoriasServicio {
  private firestore = inject(Firestore);
  private coleccion = collection(this.firestore, 'asesorias');

  crearAsesoria(asesoria: Asesoria): Promise<any> {
    return addDoc(this.coleccion, asesoria);
  }

  crearSolicitud(asesoria: Asesoria): Promise<any> {
    return this.crearAsesoria(asesoria);
  }

  obtenerAsesoriasPorProgramador(idProgramador: string): Observable<Asesoria[]> {
    const q = query(
      this.coleccion,
      where('idProgramador', '==', idProgramador),
      orderBy('fechaSolicitud', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asesoria)))
    );
  }

  obtenerAsesoriasPorUsuario(idUsuario: string): Observable<Asesoria[]> {
    const q = query(
      this.coleccion,
      where('idUsuario', '==', idUsuario),
      orderBy('fechaSolicitud', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asesoria)))
    );
  }

  actualizarEstado(idAsesoria: string, estado: 'aprobada' | 'rechazada', mensajeRespuesta?: string): Promise<void> {
    const docRef = doc(this.firestore, `asesorias/${idAsesoria}`);
    return updateDoc(docRef, {
      estado,
      mensajeRespuesta
    });
  }
}
