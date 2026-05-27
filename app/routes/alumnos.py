from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Alumno, Salon
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/alumnos", tags=["Alumnos"])

# --- Schemas locales ---
class AlumnoCreate(BaseModel):
    codigo: str
    nombres: str
    apellidos: str
    dni: str
    Salon_id: int
    fecha_nacimiento: Optional[str] = None
    fecha_matricula: Optional[str] = None
    condicion: Optional[str] = None
    estado: Optional[str] = "activo"

class AlumnoOut(BaseModel):
    id: int
    codigo: str
    nombres: str
    apellidos: str
    dni: str
    Salon_id: int
    condicion: Optional[str]
    estado: Optional[str]

    class Config:
        from_attributes = True

# --- Endpoints ---
@router.post("/", response_model=AlumnoOut)
def crear_alumno(data: AlumnoCreate, db: Session = Depends(get_db)):
    # Verificar que el salón existe
    salon = db.query(Salon).filter(Salon.id == data.Salon_id).first()
    if not salon:
        raise HTTPException(status_code=404, detail="Salón no encontrado")
    
    # Verificar código único
    existe = db.query(Alumno).filter(Alumno.codigo == data.codigo).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe un alumno con ese código")

    ahora = str(datetime.now())
    alumno = Alumno(**data.model_dump(), createAt=ahora, UpdateAT=ahora)
    db.add(alumno)
    db.commit()
    db.refresh(alumno)
    return alumno

@router.get("/", response_model=List[AlumnoOut])
def listar_alumnos(salon_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Alumno)
    if salon_id:
        query = query.filter(Alumno.Salon_id == salon_id)
    return query.all()

@router.get("/{id}", response_model=AlumnoOut)
def obtener_alumno(id: int, db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return alumno

@router.get("/codigo/{codigo}", response_model=AlumnoOut)
def buscar_por_codigo(codigo: str, db: Session = Depends(get_db)):
    """Útil para verificar que el QR es válido antes de registrar"""
    alumno = db.query(Alumno).filter(Alumno.codigo == codigo).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Código no encontrado")
    return alumno

@router.put("/{id}", response_model=AlumnoOut)
def actualizar_alumno(id: int, data: AlumnoCreate, db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    for key, value in data.model_dump().items():
        setattr(alumno, key, value)
    alumno.UpdateAT = str(datetime.now())
    db.commit()
    db.refresh(alumno)
    return alumno

@router.delete("/{id}")
def eliminar_alumno(id: int, db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    db.delete(alumno)
    db.commit()
    return {"mensaje": f"Alumno '{alumno.nombres} {alumno.apellidos}' eliminado"}