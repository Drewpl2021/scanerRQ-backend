from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Alumno, Asistencia, Evento, TipoPariente
from app.schemas import AsistenciaRegistrada, EstadisticaSalon, AlumnoRanking
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/asistencia", tags=["Asistencia"])


class RegistrarAsistenciaBody(BaseModel):
    pariente: TipoPariente  # 👈 Dropdown automático en Swagger


@router.post("/registrar/{codigo}", response_model=AsistenciaRegistrada)
def registrar_asistencia(
    codigo: str,
    evento_id: int,
    body: RegistrarAsistenciaBody,
    db: Session = Depends(get_db)
):
    alumno = db.query(Alumno).filter(Alumno.codigo == codigo).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")

    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    ya_registro = db.query(Asistencia).filter(
        Asistencia.alumnos_id == alumno.id,
        Asistencia.eventos_id == evento_id
    ).first()
    if ya_registro:
        raise HTTPException(status_code=400, detail=f"{alumno.nombres} ya registró asistencia")

    ahora = datetime.now()
    nueva = Asistencia(
        hora=ahora.strftime("%H:%M:%S"),
        fecha=ahora.strftime("%Y-%m-%d"),
        pariente=body.pariente,       # 👈 Guarda el pariente seleccionado
        alumnos_id=alumno.id,
        eventos_id=evento_id,
        createAt=str(ahora),
        updateAt=str(ahora)
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return AsistenciaRegistrada(
        mensaje="Asistencia registrada exitosamente",
        alumno=f"{alumno.nombres} {alumno.apellidos}",
        salon=f"{alumno.salon.nombre} - {alumno.salon.grado} {alumno.salon.seccion}",
        hora=nueva.hora,
        fecha=nueva.fecha
    )


@router.get("/estadisticas/salones/{evento_id}", response_model=List[EstadisticaSalon])
def estadisticas_por_salon(evento_id: int, db: Session = Depends(get_db)):
    asistencias = db.query(Asistencia).filter(Asistencia.eventos_id == evento_id).all()

    conteo = {}
    for a in asistencias:
        salon = a.alumno.salon
        key = salon.id
        if key not in conteo:
            conteo[key] = EstadisticaSalon(
                salon=salon.nombre,
                grado=salon.grado,
                seccion=salon.seccion,
                total_asistencias=0
            )
        conteo[key].total_asistencias += 1

    return list(conteo.values())


@router.get("/ranking/primeros/{evento_id}", response_model=List[AlumnoRanking])
def ranking_primeros(evento_id: int, limite: int = 15, db: Session = Depends(get_db)):
    """Los primeros N alumnos en llegar"""
    asistencias = db.query(Asistencia).filter(
        Asistencia.eventos_id == evento_id
    ).order_by(Asistencia.hora).limit(limite).all()

    return [
        AlumnoRanking(
            nombre=a.alumno.nombres,
            apellido=a.alumno.apellidos,
            salon=f"{a.alumno.salon.grado} {a.alumno.salon.seccion}",
            hora=a.hora,
            fecha=a.fecha,
            pariente=a.pariente.value if a.pariente else None
        )
        for a in asistencias
    ]


@router.get("/total/{evento_id}")
def total_asistencias(evento_id: int, db: Session = Depends(get_db)):
    """Total de alumnos registrados en el evento"""
    total = db.query(Asistencia).filter(
        Asistencia.eventos_id == evento_id
    ).count()
    return {"total": total}


@router.get("/estadisticas/niveles/{evento_id}")
def estadisticas_por_nivel(evento_id: int, db: Session = Depends(get_db)):
    """Cuántos alumnos asistieron por nivel educativo"""
    asistencias = db.query(Asistencia).filter(
        Asistencia.eventos_id == evento_id
    ).all()

    conteo = {}
    for a in asistencias:
        nivel = a.alumno.salon.nivel or "Sin nivel"
        if nivel not in conteo:
            conteo[nivel] = {"nivel": nivel, "total_asistencias": 0}
        conteo[nivel]["total_asistencias"] += 1

    return list(conteo.values())


@router.get("/estadisticas/parientes/{evento_id}")
def estadisticas_por_pariente(evento_id: int, db: Session = Depends(get_db)):
    """Cuántas veces aparece cada tipo de pariente"""
    asistencias = db.query(Asistencia).filter(
        Asistencia.eventos_id == evento_id
    ).all()

    conteo = {}
    for a in asistencias:
        pariente = a.pariente.value if a.pariente else "Sin datos"
        if pariente not in conteo:
            conteo[pariente] = {"pariente": pariente, "total": 0}
        conteo[pariente]["total"] += 1

    return list(conteo.values())