from pydantic import BaseModel
from typing import Optional

class AsistenciaOut(BaseModel):
    id: int
    hora: str
    fecha: str
    alumno_nombre: str
    alumno_apellido: str
    salon_nombre: str
    salon_grado: str
    salon_seccion: str

    class Config:
        from_attributes = True

class AsistenciaRegistrada(BaseModel):
    mensaje: str
    alumno: str
    salon: str
    hora: str
    fecha: str

class EstadisticaSalon(BaseModel):
    salon: str
    grado: str
    seccion: str
    total_asistencias: int

class AlumnoRanking(BaseModel):
    nombre: str
    apellido: str
    salon: str
    hora: str
    fecha: str
    pariente: Optional[str] = None