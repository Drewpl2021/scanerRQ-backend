from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

# 👇 Define los valores permitidos
class TipoPariente(str, enum.Enum):
    padre = "Padre"
    madre = "Madre"
    tio = "Tío/Tía"
    abuelo = "Abuelo/Abuela"
    apoderado = "Apoderado"

class Salon(Base):
    __tablename__ = "Salon"

    id = Column(Integer, primary_key=True)
    nivel = Column(String(45))
    grado = Column(String(45))
    seccion = Column(String(45))
    nombre = Column(String(45))
    sede = Column(String(45))
    createAt = Column(String(45))
    updateAt = Column(String(45))

    alumnos = relationship("Alumno", back_populates="salon")


class Alumno(Base):
    __tablename__ = "alumnos"

    id = Column(Integer, primary_key=True)
    codigo = Column(String(45), unique=True, index=True)
    nombres = Column(String(45))
    apellidos = Column(String(45))
    dni = Column(String(45))
    Salon_id = Column(Integer, ForeignKey("Salon.id"))
    fecha_nacimiento = Column(String(45))
    fecha_matricula = Column(String(45))
    condicion = Column(String(45))
    estado = Column(String(45))
    createAt = Column(String(45))
    UpdateAT = Column(String(45))

    salon = relationship("Salon", back_populates="alumnos")
    asistencias = relationship("Asistencia", back_populates="alumno")


class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(45))
    fecha_inicio = Column(String(45))
    fecha_fin = Column(String(45))
    createAt = Column(String(45))
    updateAt = Column(String(45))

    asistencias = relationship("Asistencia", back_populates="evento")


class Asistencia(Base):
    __tablename__ = "asistencias"

    id = Column(Integer, primary_key=True)
    hora = Column(String(45))
    fecha = Column(String(45))
    pariente = Column(Enum(TipoPariente))  # 👈 Solo acepta los valores del Enum
    alumnos_id = Column(Integer, ForeignKey("alumnos.id"))
    eventos_id = Column(Integer, ForeignKey("eventos.id"))
    createAt = Column(String(45))
    updateAt = Column(String(45))

    alumno = relationship("Alumno", back_populates="asistencias")
    evento = relationship("Evento", back_populates="asistencias")