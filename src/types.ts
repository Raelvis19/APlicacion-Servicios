export type Rol = 'cliente' | 'admin';

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada';

export type Servicio = {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
};

export type UsuarioReserva = {
  id: number;
  nombre: string;
  email: string;
};

export type Reserva = {
  id: number;
  usuarioId: number;
  servicioId: number;
  fecha: string;
  estado: EstadoReserva;
  createdAt: string;
  updatedAt: string;
  servicio?: Servicio;
  usuario?: UsuarioReserva;
};
