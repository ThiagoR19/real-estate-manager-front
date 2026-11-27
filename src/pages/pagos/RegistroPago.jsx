import { useState } from "react";
import { fileLinesIcon, paperPlaneIcon } from "../../assets/icons";
import { Boton } from "../../components";
import { formatearMonto, nombrePeriodo } from "../../hooks/useHistorialPeriodos";
import { registrarPagoConComprobante } from "../../services/pagos";
import { TIPOS_COMPROBANTE, validarComprobante } from "../../utils/comprobantes.js";
import { DialogoComprobante } from "./Comprobante";

export default function RegistroPago({
  contratos,
  idContratoInicial,
  onRegistrado,
  onPeriodoRegistrado,
}) {
  const [idContrato, setIdContrato] = useState(idContratoInicial);
  const [periodoElegido, setPeriodoElegido] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [vistaAbierta, setVistaAbierta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const contrato = contratos.find((item) => item.idContrato === idContrato) ?? contratos[0];
  const periodo = contrato.periodos.find((item) => item.periodo === periodoElegido) ?? contrato.periodos[0];

  function limpiarArchivo() {
    setArchivo(null);
    setError("");
  }

  function elegirArchivo(evento) {
    const archivoElegido = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivoElegido) return;
    const errorArchivo = validarComprobante(archivoElegido);
    setError(errorArchivo);
    setArchivo(errorArchivo ? null : archivoElegido);
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (!archivo || enviando) return;
    setEnviando(true);
    setError("");
    try {
      const pago = await registrarPagoConComprobante(contrato.idContrato, periodo.periodo, archivo);
      onRegistrado(pago);
    } catch (error) {
      if (error.cause?.response?.status === 409) onPeriodoRegistrado(contrato.idContrato, periodo.periodo);
      else setError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <form className="registro-pago__form" onSubmit={enviar}>
        <fieldset disabled={enviando}>
          <div className="registro-pago__periodo">
            <label>
              Propiedad
              <select
                value={contrato.idContrato}
                onChange={(evento) => {
                  setIdContrato(Number(evento.target.value));
                  setPeriodoElegido(null);
                  limpiarArchivo();
                }}
              >
                {contratos.map((item) => (
                  <option key={item.idContrato} value={item.idContrato}>
                    {item.etiqueta}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Período
              <select
                value={periodo.periodo}
                onChange={(evento) => {
                  setPeriodoElegido(evento.target.value);
                  limpiarArchivo();
                }}
              >
                {contrato.periodos.map(({ periodo }) => (
                  <option key={periodo} value={periodo}>{nombrePeriodo(periodo)}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="registro-pago__importe">
            <span>Alquiler del período</span>
            <strong>{contrato.moneda} {formatearMonto(periodo.monto)}</strong>
          </p>
          <label className="registro-pago__archivo">
            <img src={fileLinesIcon} alt="" />
            <span>
              <strong>{archivo ? "Cambiar comprobante" : "Subir comprobante"}</strong>
              <small>{archivo?.name ?? "PDF, JPG, PNG o WebP de hasta 5 MB"}</small>
            </span>
            <input
              type="file"
              aria-label={archivo ? "Cambiar comprobante" : "Subir comprobante"}
              accept={TIPOS_COMPROBANTE}
              onChange={elegirArchivo}
            />
          </label>
          {error && <p className="vista-pago__error" role="alert">{error}</p>}
          <div className="registro-pago__acciones">
            {archivo && (
              <Boton className="vista-pago__action vista-pago__action--secondary" text="Ver comprobante" onClick={() => setVistaAbierta(true)} />
            )}
            <Boton
              className="vista-pago__action vista-pago__action--primary"
              type="submit"
              icon={paperPlaneIcon}
              text={enviando ? "Enviando…" : "Enviar para revisión"}
              disabled={!archivo || enviando}
            />
          </div>
        </fieldset>
      </form>
      {vistaAbierta && archivo && (
        <DialogoComprobante archivo={archivo} nombre={archivo.name} onCerrar={() => setVistaAbierta(false)} />
      )}
    </>
  );
}
