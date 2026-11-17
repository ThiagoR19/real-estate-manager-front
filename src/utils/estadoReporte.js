const etiquetas = { Abierto: "Pendiente", "En proceso": "En proceso", Resuelto: "Solucionado" };

export const estadoReporte = (estado) => etiquetas[estado] || estado || "—";
