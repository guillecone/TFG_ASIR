document.addEventListener("DOMContentLoaded", function () {
  cargarIngresos();
  cargarNuevosPacientes();
  cargarCitasPorDoctor();
  cargarTiempoMedioConsultas();
  cargarCitasAtendidasVsCanceladas();
  cargarTratamientosMasDemandados();
  cargarDoctores();
  cargarCitasRecientes();
  cargarGraficoTratamientos();
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
          let ctx = document.getElementById("chart-citas").getContext("2d");

          // Verifica si ya existe una instancia previa del gráfico para evitar duplicados
          if (window.chartCitas) {
              window.chartCitas.destroy();
          }

          window.chartCitas = new Chart(ctx, {
              type: "doughnut",
              data: {
                  labels: ["Atendidas", "Canceladas", "Pendientes"],
                  datasets: [{
                      data: [data.atendidas, data.canceladas, data.pendientes],
                      backgroundColor: ["#43A047", "#E53935", "#FFB300"]
                  }]
              },
          });
      })
      .catch(error => console.error("Error cargando citas atendidas vs. canceladas:", error));
}


// 📌 Tratamientos más demandados
function cargarTratamientosMasDemandados() {
  fetch("http://127.0.0.1:8000/tratamientos-mas-demandados")
      .then(response => response.json())
      .then(data => {
          let lista = document.getElementById("lista-tratamientos");
          lista.innerHTML = ""; // Limpia la lista antes de agregar nuevos datos
          data.forEach(item => {
              let li = document.createElement("li");
              li.textContent = `${item.tratamiento}: ${item.cantidad} veces`;
              lista.appendChild(li);
          });
      })
      .catch(error => console.error("Error cargando tratamientos más demandados:", error));
}



function cargarCitasAtendidasVsCanceladas() {
  fetch("http://127.0.0.1:8000/citas/atendidas-canceladas")
      .then(response => response.json())
      .then(data => {
          let ctx = document.getElementById("chart-citas").getContext("2d");

          // Eliminar gráfico anterior si ya existe
          if (window.chartCitas) {
              window.chartCitas.destroy();
          }

          window.chartCitas = new Chart(ctx, {
              type: "doughnut",
              data: {
                  labels: ["Atendidas", "Canceladas", "Pendientes"],
                  datasets: [{
                      data: [data.atendidas, data.canceladas, data.pendientes],
                      backgroundColor: ["#43A047", "#E53935", "#FFB300"]
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: true,  // Mantiene el ratio
                  aspectRatio: 2,  // Reduce el tamaño
                  plugins: {
                      legend: {
                          position: "top",
                          labels: {
                              font: {
                                  size: 14
                              }
                          }
                      }
                  }
              }
          });
      })
      .catch(error => console.error("Error cargando citas atendidas vs. canceladas:", error));
}

function cargarGraficoTratamientos() {
  fetch("http://127.0.0.1:8000/tratamientos-mas-demandados")
      .then(response => response.json())
      .then(data => {
          console.log("📊 Datos recibidos:", data);
          
          if (!data || data.length === 0) {
              console.error("❌ No hay datos para mostrar en el gráfico.");
              return;
          }

          let ctx = document.getElementById("chart-tratamientos").getContext("2d");
          if (!ctx) {
              console.error("❌ No se encontró el canvas con id 'chart-tratamientos'");
              return;
          }

          let tratamientos = data.map(item => item.tratamiento);
          let cantidades = data.map(item => item.cantidad);

          new Chart(ctx, {
              type: "bar",
              data: {
                  labels: tratamientos,
                  datasets: [{
                      label: "Cantidad",
                      data: cantidades,
                      backgroundColor: ["#3498db", "#2ecc71", "#e74c3c"],
                      borderColor: ["#2980b9", "#27ae60", "#c0392b"],
                      borderWidth: 1
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                      y: { beginAtZero: true }
                  }
              }
          });
      })
      .catch(error => console.error("❌ Error cargando tratamientos más demandados:", error));
}



document.addEventListener("DOMContentLoaded", function () {
  let cards = document.querySelectorAll(".card");
  let observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("visible");
          }
      });
  }, { threshold: 0.5 });

  cards.forEach(card => observer.observe(card));
});

document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.createElement("button");

  toggleBtn.innerHTML = "☰";
  toggleBtn.classList.add("sidebar-toggle");
  document.body.appendChild(toggleBtn);

  toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
  });
});

function cargarCitasRecientes() {
  fetch("http://127.0.0.1:8000/citas-recientes")
      .then(response => response.json())
      .then(data => {
          console.log("📅 Datos de citas recientes:", data);

          let tabla = document.getElementById("citas-recientes");

          if (!tabla) {
              console.error("❌ No se encontró la tabla 'citas-recientes'.");
              return;
          }

          tabla.innerHTML = ""; // Limpiar antes de agregar nuevos datos

          if (data.length === 0) {
              tabla.innerHTML = "<tr><td colspan='4'>No hay citas recientes.</td></tr>";
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
      .catch(error => console.error("❌ Error cargando citas recientes:", error));
}

// Ejecutar la función cuando la página cargue
document.addEventListener("DOMContentLoaded", cargarCitasRecientes);


document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.createElement("input");
  searchInput.placeholder = "Buscar citas...";  
  document.querySelector(".table-container").prepend(searchInput);

  searchInput.addEventListener("keyup", function () {
      let filter = searchInput.value.toLowerCase();
      let rows = document.querySelectorAll("#citas-recientes tr");
      rows.forEach(row => {
          let text = row.innerText.toLowerCase();
          row.style.display = text.includes(filter) ? "" : "none";
      });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, index) => {
      setTimeout(() => {
          card.classList.add("visible");
      }, index * 150);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("input").forEach(el => {
      if (el.placeholder === "Buscar citas...") {
          el.remove();  // 🔥 Esto lo eliminará automáticamente
          console.log("Eliminado: Buscar citas...");
      }
  });
});
