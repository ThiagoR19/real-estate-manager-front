import SelectDesplegable from "./SelectDesplegable";

function etiquetasUnicas(opciones) {
  const repeticiones = new Map();
  opciones.forEach(({ etiqueta }) => repeticiones.set(etiqueta, (repeticiones.get(etiqueta) ?? 0) + 1));
  return opciones.map(({ etiqueta, valor }) => (repeticiones.get(etiqueta) > 1 ? `${etiqueta} (#${valor})` : etiqueta));
}

export default function FiltroListado({ etiqueta, todos, opciones, valor, alCambiar, icono, prefijo, ...resto }) {
  const etiquetas = etiquetasUnicas(opciones);
  const indice = opciones.findIndex((opcion) => String(opcion.valor) === String(valor));

  return (
    <SelectDesplegable
      label={etiqueta}
      placeholder={etiqueta}
      value={indice >= 0 ? etiquetas[indice] : todos}
      options={[todos, ...etiquetas]}
      onChange={(texto) => {
        const elegida = etiquetas.indexOf(texto);
        alCambiar(elegida >= 0 ? opciones[elegida].valor : undefined);
      }}
      icon={icono}
      className={`${prefijo}__filter`}
      triggerClassName={`${prefijo}__filter-trigger`}
      iconClassName={`${prefijo}__filter-icon`}
      chevronClassName={`${prefijo}__filter-chevron`}
      {...resto}
    />
  );
}
