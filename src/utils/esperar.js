// Promesa que se resuelve después de `ms` milisegundos (simula una petición)
export default function esperar(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
}
