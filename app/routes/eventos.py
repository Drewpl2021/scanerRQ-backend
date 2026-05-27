from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Evento
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/eventos", tags=["Eventos"])

# --- Schemas locales ---
class EventoCreate(BaseModel):
    nombre: str
    fecha_inicio: str
    fecha_fin: str

class EventoOut(BaseModel):
    id: int
    nombre: str
    fecha_inicio: str
    fecha_fin: str
    createAt: Optional[str]

    class Config:
        from_attributes = True

# --- Endpoints ---
@router.post("/", response_model=EventoOut)
def crear_evento(data: EventoCreate, db: Session = Depends(get_db)):
    ahora = str(datetime.now())
    evento = Evento(**data.model_dump(), createAt=ahora, updateAt=ahora)
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento

@router.get("/", response_model=List[EventoOut])
def listar_eventos(db: Session = Depends(get_db)):
    return db.query(Evento).order_by(Evento.id.desc()).all()

@router.get("/activo")
def evento_activo(db: Session = Depends(get_db)):
    """Devuelve el evento más reciente — útil para el escáner QR"""
    evento = db.query(Evento).order_by(Evento.id.desc()).first()
    if not evento:
        raise HTTPException(status_code=404, detail="No hay eventos registrados")
    return evento

@router.get("/{id}", response_model=EventoOut)
def obtener_evento(id: int, db: Session = Depends(get_db)):
    evento = db.query(Evento).filter(Evento.id == id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return evento

@router.put("/{id}", response_model=EventoOut)
def actualizar_evento(id: int, data: EventoCreate, db: Session = Depends(get_db)):
    evento = db.query(Evento).filter(Evento.id == id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    for key, value in data.model_dump().items():
        setattr(evento, key, value)
    evento.updateAt = str(datetime.now())
    db.commit()
    db.refresh(evento)
    return evento

@router.delete("/{id}")
def eliminar_evento(id: int, db: Session = Depends(get_db)):
    evento = db.query(Evento).filter(Evento.id == id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    db.delete(evento)
    db.commit()
    return {"mensaje": f"Evento '{evento.nombre}' eliminado"}
