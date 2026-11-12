// Promesa que se resuelve después de `ms` milisegundos (simula una petición)
export default function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
