from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Alumno, Asistencia, Evento, TipoPariente
from app.schemas import AsistenciaRegistrada, EstadisticaSalon, AlumnoRanking
from typing import List, Optional
from pydantic import BaseModel


from datetime import datetime
import pytz
ZONA_PERU = pytz.timezone('America/Lima')

router = APIRouter(prefix="/asistencia", tags=["Asistencia"])


class RegistrarAsistenciaBody(BaseModel):
    pariente: TipoPariente


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

    # Hora en zona horaria de Perú (UTC-5)
    zona_peru = pytz.timezone('America/Lima')
    ahora = datetime.now(zona_peru)
    hoy = ahora.strftime("%Y-%m-%d")

    # Verifica por evento Y por fecha — 1 registro por día
    ya_registro = db.query(Asistencia).filter(
        Asistencia.alumnos_id == alumno.id,
        Asistencia.eventos_id == evento_id,
        Asistencia.fecha == hoy
    ).first()
    if ya_registro:
        raise HTTPException(
            status_code=400,
            detail=f"{alumno.nombres} {alumno.apellidos} ya registró asistencia hoy ({hoy})"
        )

    nueva = Asistencia(
        hora=ahora.strftime("%H:%M:%S"),
        fecha=hoy,
        pariente=body.pariente,
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

@router.get("/reporte/completo/{evento_id}")
def reporte_completo(
    evento_id: int,
    fecha: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Todos los asistentes del evento para el reporte Excel"""
    query = db.query(Asistencia).filter(Asistencia.eventos_id == evento_id)
    if fecha:
        query = query.filter(Asistencia.fecha == fecha)
    asistencias = query.order_by(Asistencia.hora).all()

    return [
        {
            "nombres": a.alumno.nombres,
            "apellidos": a.alumno.apellidos,
            "dni": a.alumno.dni,
            "salon": f"{a.alumno.salon.nombre}",
            "grado": a.alumno.salon.grado,
            "seccion": a.alumno.salon.seccion,
            "nivel": a.alumno.salon.nivel,
            "sede": a.alumno.salon.sede,
            "hora": a.hora,
            "fecha": a.fecha,
            "pariente": a.pariente.value if a.pariente else "—",
            "evento": a.evento.nombre,
        }
        for a in asistencias
    ]


@router.get("/reporte/porcentaje/{evento_id}")
def reporte_porcentaje(
    evento_id: int,
    fecha: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Porcentaje de asistencia: total alumnos vs cuántos asistieron"""
    from app.models import Salon

    # Todos los salones con sus alumnos
    salones = db.query(Salon).all()

    # IDs de alumnos que asistieron
    query = db.query(Asistencia).filter(Asistencia.eventos_id == evento_id)
    if fecha:
        query = query.filter(Asistencia.fecha == fecha)
    asistencias = query.all()

    asistieron_ids = set(a.alumnos_id for a in asistencias)

    resultado = []

    for salon in salones:
        alumnos_salon = [a for a in salon.alumnos if a.estado == 'Vigente']
        total = len(alumnos_salon)
        if total == 0:
            continue
        asistieron = len([a for a in alumnos_salon if a.id in asistieron_ids])
        porcentaje = round((asistieron / total) * 100, 1)

        resultado.append({
            "nivel": salon.nivel,
            "grado": salon.grado,
            "seccion": salon.seccion,
            "salon": salon.nombre,
            "sede": salon.sede,
            "total_alumnos": total,
            "asistieron": asistieron,
            "no_asistieron": total - asistieron,
            "porcentaje": porcentaje,
        })

    # Resumen general
    total_general = sum(r["total_alumnos"] for r in resultado)
    asistieron_general = sum(r["asistieron"] for r in resultado)
    porcentaje_general = round((asistieron_general / total_general) * 100, 1) if total_general > 0 else 0

    return {
        "resumen": {
            "total_alumnos": total_general,
            "asistieron": asistieron_general,
            "no_asistieron": total_general - asistieron_general,
            "porcentaje_general": porcentaje_general,
        },
        "por_salon": resultado,
        "por_nivel": _agrupar_por_nivel(resultado),
        "por_sede": _agrupar_por_sede(resultado),
    }


def _agrupar_por_nivel(resultado):
    niveles = {}
    for r in resultado:
        n = r["nivel"]
        if n not in niveles:
            niveles[n] = {"nivel": n, "total_alumnos": 0, "asistieron": 0}
        niveles[n]["total_alumnos"] += r["total_alumnos"]
        niveles[n]["asistieron"] += r["asistieron"]
    for n in niveles.values():
        n["porcentaje"] = round((n["asistieron"] / n["total_alumnos"]) * 100, 1)
    return list(niveles.values())


def _agrupar_por_sede(resultado):
    sedes = {}
    for r in resultado:
        s = r["sede"]
        if s not in sedes:
            sedes[s] = {"sede": s, "total_alumnos": 0, "asistieron": 0}
        sedes[s]["total_alumnos"] += r["total_alumnos"]
        sedes[s]["asistieron"] += r["asistieron"]
    for s in sedes.values():
        s["porcentaje"] = round((s["asistieron"] / s["total_alumnos"]) * 100, 1)
    return list(sedes.values())
    
@router.get("/estadisticas/salones/{evento_id}", response_model=List[EstadisticaSalon])
def estadisticas_por_salon(
    evento_id: int,
    fecha: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Asistencia).filter(Asistencia.eventos_id == evento_id)
    if fecha:
        query = query.filter(Asistencia.fecha == fecha)
    asistencias = query.all()

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
def ranking_primeros(
    evento_id: int,
    limite: int = 15,
    fecha: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Asistencia).filter(Asistencia.eventos_id == evento_id)
    if fecha:
        query = query.filter(Asistencia.fecha == fecha)
    asistencias = query.order_by(Asistencia.hora).limit(limite).all()

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
def total_asistencias(
    evento_id: int,
    fecha: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Asistencia).filter(Asistencia.eventos_id == evento_id)
    if fecha:
        query = query.filter(Asistencia.fecha == fecha)
    return {"total": query.count()}


@router.get("/estadisticas/niveles/{evento_id}")
def estadisticas_por_nivel(
    evento_id: int,
    fecha: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Asistencia).filter(Asistencia.eventos_id == evento_id)
    if fecha:
        query = query.filter(Asistencia.fecha == fecha)
    asistencias = query.all()

    conteo = {}
    for a in asistencias:
        nivel = a.alumno.salon.nivel or "Sin nivel"
        if nivel not in conteo:
            conteo[nivel] = {"nivel": nivel, "total_asistencias": 0}
        conteo[nivel]["total_asistencias"] += 1
    return list(conteo.values())


@router.get("/estadisticas/parientes/{evento_id}")
def estadisticas_por_pariente(
    evento_id: int,
    fecha: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Asistencia).filter(Asistencia.eventos_id == evento_id)
    if fecha:
        query = query.filter(Asistencia.fecha == fecha)
    asistencias = query.all()

    conteo = {}
    for a in asistencias:
        pariente = a.pariente.value if a.pariente else "Sin datos"
        if pariente not in conteo:
            conteo[pariente] = {"pariente": pariente, "total": 0}
        conteo[pariente]["total"] += 1
    return list(conteo.values())