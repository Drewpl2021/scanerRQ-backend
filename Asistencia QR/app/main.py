from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import asistencia, salones, alumnos, eventos

# 👇 Estas 2 líneas crean TODAS las tablas automáticamente
import app.models  # Asegura que los modelos estén cargados
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Asistencia QR", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(salones.router)
app.include_router(alumnos.router)
app.include_router(eventos.router)
app.include_router(asistencia.router)

@app.get("/")
def root():
    return {"mensaje": "API de Asistencia QR funcionando ✅"}