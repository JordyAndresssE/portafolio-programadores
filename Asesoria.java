package ec.edu.ups.backproyecto.modelo;

import java.util.Date;
import jakarta.persistence.*;

@Entity
@Table(name = "TBL_ASESORIA")
public class Asesoria {
	
	@Id
	@Column(name = "ase_id", length = 50)
	private String id;
	
	@Column(name = "ase_id_programador", length = 50, nullable = false)
	private String idProgramador;
	
	@Column(name = "ase_id_usuario", length = 50, nullable = false)
	private String idUsuario;
	
	@Column(name = "ase_nombre_usuario", length = 100)
	private String nombreUsuario;
	
	@Column(name = "ase_email_usuario", length = 100)
	private String emailUsuario;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "ase_fecha_solicitud")
	private Date fechaSolicitud;
	
	@Column(name = "ase_fecha_asesoria", length = 20)
	private String fechaAsesoria; // Formato: YYYY-MM-DD
	
	@Column(name = "ase_hora_asesoria", length = 10)
	private String horaAsesoria; // Formato: HH:mm
	
	@Column(name = "ase_motivo", length = 1000)
	private String motivo;
	
	@Column(name = "ase_estado", length = 20, nullable = false)
	private String estado; // pendiente, aprobada, rechazada, cancelada
	
	@Column(name = "ase_mensaje_respuesta", length = 1000)
	private String mensajeRespuesta;
	
	@Column(name = "ase_motivo_cancelacion", length = 1000)
	private String motivoCancelacion;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "ase_fecha_cancelacion")
	private Date fechaCancelacion;
	
	// Constructores
	public Asesoria() {
	}

	// Getters y Setters
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getIdProgramador() {
		return idProgramador;
	}

	public void setIdProgramador(String idProgramador) {
		this.idProgramador = idProgramador;
	}

	public String getIdUsuario() {
		return idUsuario;
	}

	public void setIdUsuario(String idUsuario) {
		this.idUsuario = idUsuario;
	}

	public String getNombreUsuario() {
		return nombreUsuario;
	}

	public void setNombreUsuario(String nombreUsuario) {
		this.nombreUsuario = nombreUsuario;
	}

	public String getEmailUsuario() {
		return emailUsuario;
	}

	public void setEmailUsuario(String emailUsuario) {
		this.emailUsuario = emailUsuario;
	}

	public Date getFechaSolicitud() {
		return fechaSolicitud;
	}

	public void setFechaSolicitud(Date fechaSolicitud) {
		this.fechaSolicitud = fechaSolicitud;
	}

	public String getFechaAsesoria() {
		return fechaAsesoria;
	}

	public void setFechaAsesoria(String fechaAsesoria) {
		this.fechaAsesoria = fechaAsesoria;
	}

	public String getHoraAsesoria() {
		return horaAsesoria;
	}

	public void setHoraAsesoria(String horaAsesoria) {
		this.horaAsesoria = horaAsesoria;
	}

	public String getMotivo() {
		return motivo;
	}

	public void setMotivo(String motivo) {
		this.motivo = motivo;
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
	}

	public String getMensajeRespuesta() {
		return mensajeRespuesta;
	}

	public void setMensajeRespuesta(String mensajeRespuesta) {
		this.mensajeRespuesta = mensajeRespuesta;
	}

	public String getMotivoCancelacion() {
		return motivoCancelacion;
	}

	public void setMotivoCancelacion(String motivoCancelacion) {
		this.motivoCancelacion = motivoCancelacion;
	}

	public Date getFechaCancelacion() {
		return fechaCancelacion;
	}

	public void setFechaCancelacion(Date fechaCancelacion) {
		this.fechaCancelacion = fechaCancelacion;
	}

	@Override
	public String toString() {
		return "Asesoria [id=" + id + ", idProgramador=" + idProgramador + 
		       ", idUsuario=" + idUsuario + ", estado=" + estado + 
		       ", fechaAsesoria=" + fechaAsesoria + "]";
	}
}
