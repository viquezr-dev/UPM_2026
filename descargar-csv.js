async function exportarCSV() {
  // 1. Validar si existen datos visibles para exportar
  if (typeof emlFiltrados === 'undefined' || emlFiltrados.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  // 2. Pedir la contraseña al usuario
  const password = prompt("Ingresa la contraseña para descargar el CSV:");
  if (!password) return; // Se cancela si el usuario presiona "Cancelar" o lo deja vacío

  try {
    // 3. Buscar el archivo pass_eml.txt en la misma carpeta raíz
    const response = await fetch('pass_eml.txt');

    if (!response.ok) {
      alert("No se pudo encontrar el archivo 'pass_eml.txt' en el servidor.");
      return;
    }

    // Leer el texto y limpiar saltos de línea invisibles (\n, \r) y espacios
    const passwordCorrecta = (await response.text()).trim();

    // 4. Comparar contraseñas
    if (password.trim() !== passwordCorrecta) {
      alert("Contraseña incorrecta. Acceso denegado.");
      return;
    }

    // 5. Si la clave es CORRECTA, procesar y descargar el CSV
    const keys = Object.keys(emlFiltrados[0].properties || {});
    const headers = [...keys, "DISTANCIA_OFICINA_KM"];
    let csv = headers.join(",") + "\n";

    emlFiltrados.forEach(f => {
      const props = f.properties || {};
      const tempLayer = L.geoJSON(f);
      const centroide = tempLayer.getBounds().getCenter();
      const provEml = props.PROV_NOMB?.trim().toUpperCase();

      let oficinasBuscar = oficinaData.filter(o => o.properties?.PROV_NOMB?.trim().toUpperCase() === provEml);
      if (oficinasBuscar.length === 0) oficinasBuscar = oficinaData;

      let distanciaMinima = Infinity;

      oficinasBuscar.forEach(oficina => {
        const coords = obtenerCoordenadasOficina(oficina);
        if (coords) {
          const latLngOficina = L.latLng(coords.lat, coords.lon);
          const dist = centroide.distanceTo(latLngOficina);
          if (dist < distanciaMinima) {
            distanciaMinima = dist;
          }
        }
      });

      const distanciaKm = distanciaMinima !== Infinity ? (distanciaMinima / 1000).toFixed(2) : "N/D";

      let row = keys.map(k => `"${props[k] ?? ''}"`);
      row.push(`"${distanciaKm}"`);
      
      csv += row.join(",") + "\n";
    });

    // 6. Generar el archivo y simular la descarga
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `eml_filtrados_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("Error al verificar la contraseña:", error);
    alert("Ocurrió un error al intentar verificar la contraseña.");
  }
}