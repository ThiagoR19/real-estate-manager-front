import { useEffect, useId, useRef, useState } from "react";
import { downloadIcon, fileLinesIcon, magnifyingGlassIcon, paperPlaneIcon } from "../../assets/icons";
import { Boton, mostrarAviso } from "../../components";
import { descargarBlob } from "../../utils/descargarArchivo";
import "./Comprobante.css";

function useComprobante(cargar, id, archivo, version) {
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    let activo = true;
    let url;
    const descarga = archivo ? Promise.resolve(archivo) : cargar(id);
    descarga.then((blob) => {
      if (!activo) return;
      url = URL.createObjectURL(blob);
      setResultado({ id, archivo, version, blob, url });
    }).catch((error) => {
      if (activo) setResultado({ id, archivo, version, error: error.message });
    });

    return () => {
      activo = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [cargar, id, archivo, version]);

  return resultado?.id === id && resultado?.archivo === archivo && resultado?.version === version
    ? resultado
    : null;
}

function ContenidoComprobante({ resultado, nombre, ampliado = false }) {
  if (!resultado || resultado.error) {
    return <p className="comprobante__mensaje" role="status">{resultado?.error || "Cargando comprobante…"}</p>;
  }

  const { blob, url } = resultado;
  if (blob.type.startsWith("image/")) {
    return <img className="comprobante__imagen" src={url} alt={nombre || "Comprobante de pago"} />;
  }
  if (ampliado && (blob.type === "application/pdf" || /\.pdf$/i.test(nombre ?? ""))) {
    return <iframe className="comprobante__pdf" src={url} title={nombre || "Comprobante de pago"} />;
  }
  return (
    <div className="comprobante__mensaje">
      <img src={fileLinesIcon} alt="" />
      <span>{nombre || "Comprobante"}</span>
    </div>
  );
}

export function VistaComprobante({ cargar, id, nombre, archivo, version, onAbrir }) {
  const resultado = useComprobante(cargar, id, archivo, version);
  return (
    <div className="comprobante__vista">
      <ContenidoComprobante resultado={resultado} nombre={nombre} />
      {onAbrir && (
        <button className="comprobante__ampliar" type="button" onClick={onAbrir} aria-label="Ampliar comprobante">
          <img src={magnifyingGlassIcon} alt="" />
        </button>
      )}
    </div>
  );
}

function DialogoPago({ titulo, onCerrar, children }) {
  const dialogo = useRef(null);
  const tituloId = useId();

  useEffect(() => {
    const elemento = dialogo.current;
    elemento.showModal();
    return () => elemento.close();
  }, []);

  return (
    <dialog
      ref={dialogo}
      className="comprobante__dialogo"
      aria-labelledby={tituloId}
      onCancel={(evento) => {
        evento.preventDefault();
        onCerrar();
      }}
    >
      <header>
        <h2 id={tituloId}>{titulo}</h2>
        <button type="button" onClick={onCerrar} aria-label="Cerrar">×</button>
      </header>
      {children}
    </dialog>
  );
}

export function DialogoComprobante({ cargar, id, nombre, archivo, version, onCerrar }) {
  const resultado = useComprobante(cargar, id, archivo, version);

  return (
    <DialogoPago titulo="Comprobante" onCerrar={onCerrar}>
      <div className="comprobante__dialogo-vista">
        <ContenidoComprobante resultado={resultado} nombre={nombre} ampliado />
      </div>
      {resultado?.blob && (
        <Boton
          className="comprobante__dialogo-boton"
          icon={downloadIcon}
          text="Descargar comprobante"
          onClick={() => descargarBlob(resultado.blob, nombre || "comprobante")}
        />
      )}
    </DialogoPago>
  );
}

export function DialogoRevision({ periodo, solicitar, id, onCerrar }) {
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function enviar(evento) {
    evento.preventDefault();
    if (motivo.trim().length < 3 || enviando) return;
    setEnviando(true);
    setError("");
    try {
      await solicitar(id, motivo.trim());
      mostrarAviso({ tipo: "exito", titulo: "Solicitud enviada", mensaje: "La inmobiliaria recibió tu solicitud de revisión." });
      onCerrar();
    } catch (causa) {
      setError(causa.message);
      setEnviando(false);
    }
  }

  return (
    <DialogoPago titulo="Solicitar revisión" onCerrar={() => !enviando && onCerrar()}>
      <form className="comprobante__revision" onSubmit={enviar}>
        <p>{periodo}</p>
        <label>
          Motivo de la revisión
          <textarea
            required
            minLength={3}
            maxLength={500}
            rows={4}
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <Boton
          type="submit"
          icon={paperPlaneIcon}
          text={enviando ? "Enviando…" : "Enviar solicitud"}
          disabled={motivo.trim().length < 3 || enviando}
        />
      </form>
    </DialogoPago>
  );
}
