from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Función para conectar a MySQL
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "Pa$$w0rd"),
        database=os.getenv("DB_NAME", "conesa_dental")
    )

# ✅ Endpoint principal
@app.get("/")
def home():
    return {"mensaje": "API de ConesaDental funcionando correctamente"}

# ✅ 1️⃣ Ingresos Mensuales
@app.get("/ingresos")
def obtener_ingresos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT SUM(total_ingresos) AS total_ingresos FROM ingresos")
        resultado = cursor.fetchone()
        conn.close()

        if resultado and resultado["total_ingresos"] is not None:
            return {"total_ingresos": resultado["total_ingresos"]}
        else:
            return {"total_ingresos": 0}

    except Exception as e:
        return {"error": str(e)}
    
# ✅ 2️⃣ Nuevos Pacientes
@app.get("/nuevos-pacientes")
def nuevos_pacientes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) AS total_pacientes FROM pacientes")
        resultado = cursor.fetchone()
        conn.close()

        return resultado if resultado else {"total_pacientes": 0}

    except Exception as e:
        return {"error": str(e)}

# ✅ 3️⃣ Citas por Doctor
@app.get("/citas/doctores")
def citas_por_doctor():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT d.nombre AS doctor, COUNT(c.id) AS total_citas
        FROM citas c
        JOIN doctores d ON c.doctor_id = d.id
        GROUP BY d.nombre
        """
        cursor.execute(query)
        resultado = cursor.fetchall()
        
        conn.close()
        return resultado

    except Exception as e:
        return {"error": str(e)}

# ✅ 4️⃣ Tiempo Medio entre Consultas
@app.get("/tiempo-consultas")
def tiempo_entre_consultas():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT AVG(DATEDIFF(c2.fecha, c1.fecha)) AS tiempo_promedio
        FROM citas c1
        JOIN citas c2 ON c1.paciente_id = c2.paciente_id AND c2.fecha > c1.fecha;
    """)
    resultado = cursor.fetchone()
    conn.close()
    return [{"tiempo_promedio": resultado["tiempo_promedio"] if resultado["tiempo_promedio"] is not None else "No disponible"}]


# ✅ 5️⃣ Citas Atendidas vs. Canceladas
@app.get("/citas/atendidas-canceladas")
def citas_atendidas_vs_canceladas():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) AS atendidas,
            SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) AS canceladas
        FROM citas;
    """)
    resultado = cursor.fetchone()
    conn.close()
    return [{"atendidas": resultado["atendidas"], "canceladas": resultado["canceladas"]}]


# ✅ 6️⃣ Tratamientos Más Demandados
@app.get("/tratamientos-mas-demandados")
def tratamientos_mas_demandados():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        cursor = conn.cursor(dictionary=True)

        # 🔹 Consulta para obtener los tratamientos más demandados
        query = """
        SELECT t.nombre AS tratamiento, COUNT(ct.id) AS cantidad
        FROM citas_tratamientos ct
        JOIN tratamientos t ON ct.tratamiento_id = t.id
        GROUP BY t.nombre
        ORDER BY cantidad DESC
        """
        cursor.execute(query)
        resultado = cursor.fetchall()

        conn.close()
        return resultado

    except Exception as e:
        return {"error": str(e)}


# ✅ 7️⃣ Lista de Doctores
@app.get("/doctores")
def doctores():
    conn = conectar_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nombre FROM doctores")
    resultado = cursor.fetchall()
    conn.close()
    return resultado

from fastapi import HTTPException

@app.get("/citas-recientes")
def citas_recientes():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        cursor = conn.cursor(dictionary=True)

        # 🔹 Consulta para obtener las últimas citas con información del paciente y doctor
        query = """
        SELECT c.fecha, c.estado, p.nombre AS paciente, d.nombre AS doctor
        FROM citas c
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN doctores d ON c.doctor_id = d.id
        ORDER BY c.fecha DESC
        LIMIT 5
        """
        cursor.execute(query)
        resultado = cursor.fetchall()

        conn.close()
        return resultado

    except Exception as e:
        return {"error": str(e)}

    
# ✅ Iniciar el servidor
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)