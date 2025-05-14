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
function cargarGraficoIngresos() {
  fetch("http://127.0.0.1:8000/ingresos")
    .then(response => response.json())
    .then(data => {
      console.log("📈 Datos de ingresos recibidos:", data);

      if (!Array.isArray(data) || data.length === 0) {
        console.error("❌ No hay datos disponibles para el gráfico.");
        return;
      }

      let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

      // 🔹 Mapear los datos de la API
      let labels = data.map(item => meses[item.mes - 1]); // Convertir el número de mes a nombre
      let ingresos = data.map(item => item.total_ingresos);

      let ctx = document.getElementById("chart-ingresos").getContext("2d");

      new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,  // Nombres de los meses
          datasets: [{
            label: "Ingresos ($)",
            data: ingresos,  // Valores de ingresos
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            borderWidth: 2,
            fill: true,
            tension: 0.3
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
    .catch(error => console.error("❌ Error cargando ingresos mensuales:", error));
}

document.addEventListener("DOMContentLoaded", cargarGraficoIngresos);




// ✅ 2️⃣ Nuevos Pacientes
function cargarNuevosPacientes() {
  fetch("http://127.0.0.1:8000/nuevos-pacientes")
    .then(response => response.json())
    .then(data => {
      console.log("👥 Datos de nuevos pacientes recibidos:", data);

      let totalPacientes = data.total_pacientes || 0;
      document.getElementById("nuevos-pacientes").textContent = totalPacientes;

      let icono = document.getElementById("icono-pacientes");

      // 🔹 Cambiar icono según cantidad de pacientes
      if (totalPacientes > 50) {
        icono.className = "fas fa-users";  // Icono de grupo de personas
        icono.style.color = "#ff9800";  // Naranja si hay muchos pacientes
      } else if (totalPacientes > 20) {
        icono.className = "fas fa-user-friends";  // Icono de dos personas
        icono.style.color = "#4CAF50";  // Verde si hay pacientes moderados
      } else {
        icono.className = "fas fa-user-plus";  // Icono de un solo usuario
        icono.style.color = "#2196F3";  // Azul si hay pocos pacientes
      }

      // 🔹 Pequeña animación al actualizar
      icono.style.transform = "scale(1.2)";
      setTimeout(() => icono.style.transform = "scale(1)", 300);
    })
    .catch(error => console.error("❌ Error cargando nuevos pacientes:", error));
}

// Ejecutar cuando la página cargue
document.addEventListener("DOMContentLoaded", cargarNuevosPacientes);


// ✅ 3️⃣ Citas por Doctor
function cargarCitasPorDoctor() {
  fetch("http://127.0.0.1:8000/citas/doctores")
    .then(response => response.json())
    .then(data => {
      console.log("📊 Datos de citas por doctor:", data);

      if (!data || data.length === 0) {
        console.error("❌ No hay datos para mostrar en el gráfico.");
        return;
      }

      let ctx = document.getElementById("chart-citas-doctor").getContext("2d");
      if (!ctx) {
        console.error("❌ No se encontró el canvas con id 'chart-citas-doctor'");
        return;
      }

      let doctores = data.map(item => item.doctor);
      let citas = data.map(item => item.total_citas);

      // Crear gráfico de barras horizontales
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: doctores,
          datasets: [{
            label: "Citas",
            data: citas,
            backgroundColor: ["#4CAF50", "#FF9800", "#3498db", "#e74c3c", "#8e44ad"],
            borderColor: "#333",
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y", // 🔹 Hace que sea un gráfico horizontal
          scales: {
            x: { beginAtZero: true }
          },
          animation: {
            duration: 1000,
            easing: "easeOutBounce"
          }
        }
      });
    })
    .catch(error => console.error("❌ Error cargando citas por doctor:", error));
}

// Ejecutar cuando la página cargue
document.addEventListener("DOMContentLoaded", cargarCitasPorDoctor);



// ✅ 4️⃣ Tiempo Medio entre Consultas
function cargarTiempoMedioConsultas() {
  fetch("http://127.0.0.1:8000/tiempo-consultas")
    .then(response => response.json())
    .then(data => {
      console.log("⏳ Tiempo medio entre consultas:", data);

      if (!data || data.length === 0 || data[0].tiempo_promedio === null) {
        document.getElementById("tiempo-consultas").innerText = "No disponible";
        return;
      }

      let tiempoMedio = parseFloat(data[0].tiempo_promedio).toFixed(1); // Convertir a número con 1 decimal
      document.getElementById("tiempo-consultas").innerText = `${tiempoMedio} días`;

      // Convertimos el valor en porcentaje para la barra (máximo = 30 días)
      let porcentaje = Math.min((tiempoMedio / 30) * 100, 100);
      document.getElementById("progress-bar-consultas").style.width = `${porcentaje}%`;

      // Cambiar color dinámicamente según el tiempo medio
      let progressBar = document.getElementById("progress-bar-consultas");
      if (tiempoMedio < 7) {
        progressBar.style.background = "#2ecc71"; // Verde (bueno)
      } else if (tiempoMedio < 14) {
        progressBar.style.background = "#f1c40f"; // Amarillo (moderado)
      } else {
        progressBar.style.background = "#e74c3c"; // Rojo (alto)
      }
    })
    .catch(error => console.error("❌ Error cargando tiempo medio entre consultas:", error));
}

// Ejecutar cuando la página cargue
document.addEventListener("DOMContentLoaded", cargarTiempoMedioConsultas);


// Variables globales para los gráficos
let chartCitas = null;
let chartTratamientos = null;

// 📌 Citas atendidas vs. canceladas
function cargarTiempoMedioConsultas() {
  fetch("http://127.0.0.1:8000/tiempo-consultas")
    .then(response => response.json())
    .then(data => {
      console.log("⏳ Tiempo medio entre consultas:", data);

      if (!data || data.length === 0 || data[0].tiempo_promedio === null) {
        document.getElementById("tiempo-consultas").innerText = "No disponible";
        return;
      }

      let tiempoMedioDias = parseFloat(data[0].tiempo_promedio);
      let tiempoMedioHoras = (tiempoMedioDias * 1).toFixed(1); // Convertir a horas

      document.getElementById("tiempo-consultas").innerText = `${tiempoMedioHoras} horas`;

      // Convertimos el valor en porcentaje para la barra (máximo = 30 días → 720 horas)
      let porcentaje = Math.min((tiempoMedioHoras / 1) * 100, 100);
      let progressBar = document.getElementById("progress-bar-consultas");

      progressBar.style.width = `${porcentaje}%`;

      // 🌈 Cambiar color de la barra dinámicamente
      if (tiempoMedioHoras < 24) {
        progressBar.style.background = "#2ecc71"; // 🟢 Verde (menos de 1 día)
      } else if (tiempoMedioHoras < 72) {
        progressBar.style.background = "#f1c40f"; // 🟡 Amarillo (1-3 días)
      } else {
        progressBar.style.background = "#e74c3c"; // 🔴 Rojo (más de 3 días)
      }
    })
    .catch(error => console.error("❌ Error cargando tiempo medio entre consultas:", error));
}

// Cargar datos cuando la página termine de cargar
document.addEventListener("DOMContentLoaded", cargarTiempoMedioConsultas);


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



function cargarGraficoCitas() {
  fetch("http://127.0.0.1:8000/citas/atendidas-canceladas")
    .then(response => response.json())
    .then(data => {
      let ctx = document.getElementById("chart-citas").getContext("2d");

      let totalAtendidas = data.atendidas || 0;
      let totalCanceladas = data.canceladas || 0;
      let totalPendientes = data.pendientes || 0; // 🔹 Incluye pendientes si lo deseas

      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Atendidas", "Canceladas", "Pendientes"],
          datasets: [{
            data: [totalAtendidas, totalCanceladas, totalPendientes],
            backgroundColor: ["#2ecc71", "#e74c3c", "#f1c40f"],
            borderColor: ["#27ae60", "#c0392b", "#f39c12"],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom"
            }
          }
        }
      });
    })
    .catch(error => console.error("❌ Error cargando citas atendidas vs. canceladas:", error));
}

// Ejecutar función después de cargar la página
document.addEventListener("DOMContentLoaded", cargarGraficoCitas);


function cargarGraficoTratamientos() {
  fetch("http://127.0.0.1:8000/tratamientos-mas-demandados")
    .then(response => response.json())
    .then(data => {
      let ctx = document.getElementById("chart-tratamientos").getContext("2d");

      let tratamientos = data.map(item => item.tratamiento);
      let cantidades = data.map(item => item.cantidad);

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: tratamientos,
          datasets: [{
            label: "Cantidad de Tratamientos",
            data: cantidades,
            backgroundColor: ["#3498db", "#e67e22", "#2ecc71", "#f1c40f", "#9b59b6"],
            borderColor: ["#2980b9", "#d35400", "#27ae60", "#f39c12", "#8e44ad"],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    })
    .catch(error => console.error("❌ Error cargando tratamientos más demandados:", error));
}

// Ejecutar función después de cargar la página
document.addEventListener("DOMContentLoaded", cargarGraficoTratamientos);




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

function animateCounter(id, start, end, duration) {
  let obj = document.getElementById(id);
  let range = end - start;
  let current = start;
  let increment = range / (duration / 16);
  let stepTime = 16;
  let timer = setInterval(() => {
      current += increment;
      obj.textContent = Math.floor(current);
      if (current >= end) {
          obj.textContent = end;
          clearInterval(timer);
      }
  }, stepTime);
}

document.addEventListener("DOMContentLoaded", function () {
  animateCounter("new-patients-counter", 0, 100, 2000); // 100 es el número de nuevos pacientes
});