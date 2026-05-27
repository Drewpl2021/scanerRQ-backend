from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Salon
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/salones", tags=["Salones"])

# --- Schemas locales ---
class SalonCreate(BaseModel):
    nivel: str
    grado: str
    seccion: str
    nombre: str
    sede: str

class SalonOut(BaseModel):
    id: int
    nivel: str
    grado: str
    seccion: str
    nombre: str
    sede: str

    class Config:
        from_attributes = True

# --- Endpoints ---
@router.post("/", response_model=SalonOut)
def crear_salon(data: SalonCreate, db: Session = Depends(get_db)):
    ahora = str(datetime.now())
    salon = Salon(**data.model_dump(), createAt=ahora, updateAt=ahora)
    db.add(salon)
    db.commit()
    db.refresh(salon)
    return salon

@router.get("/", response_model=List[SalonOut])
def listar_salones(db: Session = Depends(get_db)):
    return db.query(Salon).all()

@router.get("/{id}", response_model=SalonOut)
def obtener_salon(id: int, db: Session = Depends(get_db)):
    salon = db.query(Salon).filter(Salon.id == id).first()
    if not salon:
        raise HTTPException(status_code=404, detail="Salón no encontrado")
    return salon

@router.put("/{id}", response_model=SalonOut)
def actualizar_salon(id: int, data: SalonCreate, db: Session = Depends(get_db)):
    salon = db.query(Salon).filter(Salon.id == id).first()
    if not salon:
        raise HTTPException(status_code=404, detail="Salón no encontrado")
    for key, value in data.model_dump().items():
        setattr(salon, key, value)
    salon.updateAt = str(datetime.now())
    db.commit()
    db.refresh(salon)
    return salon

@router.delete("/{id}")
def eliminar_salon(id: int, db: Session = Depends(get_db)):
    salon = db.query(Salon).filter(Salon.id == id).first()
    if not salon:
        raise HTTPException(status_code=404, detail="Salón no encontrado")
    db.delete(salon)
    db.commit()
    return {"mensaje": f"Salón '{salon.nombre}' eliminado"}