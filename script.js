document.addEventListener("DOMContentLoaded", function () {
  cargarIngresos();
  cargarNuevosPacientes();
  cargarCitasPorDoctor();
  cargarTiempoMedioConsultas();
  cargarCitasAtendidasVsCanceladas();
  cargarTratamientosMasDemandados();
  cargarDoctores();
  cargarCitasRecientes();
});

// ✅ 1️⃣ Ingresos Mensuales
function cargarIngresos() {
  fetch("http://127.0.0.1:8000/ingresos")
      .then(response => response.json())
      .then(data => {
          console.log("Ingresos recibidos:", data); // ✅ Comprobar que llegan datos en la consola
          let ingresosElemento = document.getElementById("ingresos");

          if (data.total_ingresos !== undefined) {
              ingresosElemento.innerText = `$${parseFloat(data.total_ingresos).toFixed(2)}`;
          } else {
              ingresosElemento.innerText = "No disponible";
          }
      })
      .catch(error => {
          console.error("Error cargando ingresos:", error);
          document.getElementById("ingresos").innerText = "No disponible";
      });
}

// ✅ 2️⃣ Nuevos Pacientes
function cargarNuevosPacientes() {
  fetch("http://127.0.0.1:8000/nuevos-pacientes")
      .then(response => response.json())
      .then(data => {
          console.log("Datos de nuevos pacientes:", data); // 🔹 Verificar en consola
          document.getElementById("nuevos-pacientes").innerText = data.total_pacientes;
      })
      .catch(error => {
          console.error("Error cargando nuevos pacientes:", error);
          document.getElementById("nuevos-pacientes").innerText = "No disponible";
      });
}

// ✅ 3️⃣ Citas por Doctor
function cargarCitasPorDoctor() {
  fetch("http://127.0.0.1:8000/citas/doctores")
      .then(response => response.json())
      .then(data => {
          console.log("Citas por doctor:", data); // Verificar en consola
          let lista = document.getElementById("citas-doctores");
          lista.innerHTML = "";

          if (data.length === 0) {
              lista.innerHTML = "<li>No hay citas registradas</li>";
              return;
          }

          data.forEach(item => {
              let li = document.createElement("li");
              li.textContent = `${item.doctor}: ${item.total_citas} citas`;
              lista.appendChild(li);
          });
      })
      .catch(error => {
          console.error("Error cargando citas por doctor:", error);
          document.getElementById("citas-doctores").innerHTML = "<li>Error al cargar datos</li>";
      });
}


// ✅ 4️⃣ Tiempo Medio entre Consultas
function cargarTiempoMedioConsultas() {
  fetch("http://127.0.0.1:8000/tiempo-consultas")
      .then(response => response.json())
      .then(data => {
          document.getElementById("tiempo-consultas").innerText = data[0]?.tiempo_promedio ? `${data[0].tiempo_promedio} días` : "No disponible";
      })
      .catch(error => console.error("Error cargando tiempo medio entre consultas:", error));
}

// Variables globales para los gráficos
let chartCitas = null;
let chartTratamientos = null;

// 📌 Citas atendidas vs. canceladas
function cargarCitasAtendidasVsCanceladas() {
    fetch("http://127.0.0.1:8000/citas/atendidas-canceladas")
        .then(response => response.json())
        .then(data => {
            let canvas = document.getElementById("chart-citas");
            if (!canvas) {
                console.error("❌ Error: No se encontró el canvas con id 'chart-citas'");
                return;
            }

            // Resetear canvas para evitar crecimiento infinito
            canvas.parentNode.innerHTML = '<canvas id="chart-citas"></canvas>';
            canvas = document.getElementById("chart-citas");
            let ctx = canvas.getContext("2d");

            if (chartCitas) {
                chartCitas.destroy();
            }

            chartCitas = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: ["Atendidas", "Canceladas"],
                    datasets: [{
                        label: "Número de Citas",
                        data: [data[0].atendidas, data[0].canceladas],
                        backgroundColor: ["#43A047", "#FF5722"]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "top"
                        }
                    }
                }
            });
        })
        .catch(error => console.error("❌ Error cargando citas atendidas vs. canceladas:", error));
}

// 📌 Tratamientos más demandados
function cargarTratamientosMasDemandados() {
  fetch("http://127.0.0.1:8000/tratamientos-mas-demandados")
      .then(response => response.json())
      .then(data => {
          let lista = document.getElementById("lista-tratamientos");
          lista.innerHTML = ""; // Limpiar lista antes de agregar nuevos datos
          data.forEach(item => {
              let li = document.createElement("li");
              li.textContent = `${item.tratamiento}: ${item.cantidad} veces`;
              lista.appendChild(li);
          });
      })
      .catch(error => console.error("Error cargando tratamientos más demandados:", error));
}



// ✅ 7️⃣ Lista de Doctores
document.addEventListener("DOMContentLoaded", function () {
  cargarDoctores();
});

function cargarDoctores() {
  fetch("http://127.0.0.1:8000/doctores")
      .then(response => response.json())
      .then(data => {
          let lista = document.getElementById("doctores");
          lista.innerHTML = ""; // Limpiar antes de agregar elementos nuevos
          data.forEach(item => {
              let li = document.createElement("li");
              li.textContent = `${item.nombre}`;
              lista.appendChild(li);
          });
      })
      .catch(error => console.error("Error cargando doctores:", error));
}


function cargarCitasRecientes() {
  fetch("http://127.0.0.1:8000/citas-recientes")
      .then(response => response.json())
      .then(data => {
          console.log("Citas recientes:", data); // Verificar en consola

          let tabla = document.getElementById("citas-recientes");
          if (!tabla) {
              console.error("Elemento con ID 'citas-recientes' no encontrado en el HTML.");
              return;
          }

          tabla.innerHTML = ""; // 🔹 Limpiar antes de insertar datos nuevos

          if (data.length === 0) {
              tabla.innerHTML = `<tr><td colspan="4">No hay citas recientes</td></tr>`;
              return;
          }

          data.forEach(cita => {
              let fila = document.createElement("tr");
              fila.innerHTML = `
                  <td>${cita.paciente}</td>
                  <td>${cita.doctor}</td>
                  <td>${new Date(cita.fecha).toLocaleDateString()}</td>
                  <td>${cita.estado}</td>
              `;
              tabla.appendChild(fila);
          });
      })
      .catch(error => {
          console.error("Error cargando citas recientes:", error);
          let tabla = document.getElementById("citas-recientes");
          if (tabla) {
              tabla.innerHTML = `<tr><td colspan="4">Error al cargar datos</td></tr>`;
          }
      });
}
