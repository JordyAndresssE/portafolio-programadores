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

  async cancelarAsesoria(idAsesoria: string, motivoCancelacion: string): Promise<void> {
    const docRef = doc(this.firestore, `asesorias/${idAsesoria}`);
    const now = new Date();

    return updateDoc(docRef, {
      estado: 'cancelada',
      motivoCancelacion,
      fechaCancelacion: now
    });
  }

  // Validar si se puede cancelar (más de 24 horas antes)
  puedeCancelar(asesoria: Asesoria): { puede: boolean; razon?: string } {
    if (asesoria.estado === 'rechazada') {
      return { puede: false, razon: 'No puedes cancelar una asesoría rechazada' };
    }

    if (asesoria.estado === 'cancelada') {
      return { puede: false, razon: 'Esta asesoría ya está cancelada' };
    }

    // Si está pendiente, siempre puede cancelar
    if (asesoria.estado === 'pendiente') {
      return { puede: true };
    }

    // Si está aprobada, verificar que falte más de 24 horas
    if (asesoria.estado === 'aprobada') {
      const fechaAsesoria = new Date(`${asesoria.fechaAsesoria}T${asesoria.horaAsesoria}`);
      const ahora = new Date();
      const horasRestantes = (fechaAsesoria.getTime() - ahora.getTime()) / (1000 * 60 * 60);

      if (horasRestantes < 24) {
        return {
          puede: false,
          razon: 'No puedes cancelar con menos de 24 horas de anticipación'
        };
      }

      return { puede: true };
    }

    return { puede: false };
  }
}
