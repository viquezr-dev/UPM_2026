async function descargarCSV() {
  // Solo se solicita la contraseña
  const password = prompt("Ingresa la contraseña para descargar:");

  // Si presiona "Cancelar" o deja el campo vacío, se detiene
  if (!password) return;

  try {
    const response = await fetch('/api/descargar-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password })
    });

    if (response.ok) {
      // Si la clave es correcta, el navegador recibe y descarga el CSV
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "datos_provincias.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert("Contraseña incorrecta.");
    }
  } catch (error) {
    console.error("Error en la descarga:", error);
    alert("Ocurrió un error al intentar verificar la contraseña.");
  }
}