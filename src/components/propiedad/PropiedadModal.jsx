import { assetUrl } from "../../utils/assetUrl.js";
import { bathIcon, bedIcon, calendarIcon, carIcon, boltIcon, dropletIcon, fireFlameSimpleIcon, locationDotIcon, plusIcon, rulerCombinedIcon, userIcon, xIcon, } from "../../assets/icons";
import useClosingTransition from "../../hooks/useClosingTransition.js";
import { useEffect, useRef, useState } from "react";
import { Boton, mostrarAviso } from "../index";
import { api } from "../../services/api.js";
import { createPortal } from "react-dom";
import "./PropiedadModal.css";

function contratoVacio() {
  return {
    fechaInicio: "",
    fechaFin: "",
    mesesAumento: "",
    tipo: "Alquiler",
    estado: "Borrador",
    montoInicial: "",
    tipoAumento: "",
    aumentoFijo: "",
  };
}

function buscarEstadoContrato(tipo, estados) {
  const nombreEstado = tipo === "Venta" ? "Vendida" : "Alquilada";
  return estados.find((estado) => estado.nombre === nombreEstado);
}

function prepararDatosContrato(contrato) {
  const datos = {
    fechaInicio: null,
    fechaFin: null,
    mesesAumento: null,
    tipo: contrato.tipo,
    estado: "Borrador",
    montoInicial: null,
    tipoAumento: null,
    aumentoFijo: null,
  };

  if (contrato.tipo === "Venta") return datos;

  datos.fechaInicio = contrato.fechaInicio || null;
  datos.fechaFin = contrato.fechaFin || null;
  datos.mesesAumento = contrato.mesesAumento === "" ? null : Number(contrato.mesesAumento);
  datos.estado = contrato.estado;
  datos.montoInicial = contrato.montoInicial === "" ? null : Number(contrato.montoInicial);
  datos.tipoAumento = contrato.tipoAumento || null;

  if (contrato.tipoAumento === "FIJO" && contrato.aumentoFijo !== "") {
    datos.aumentoFijo = Number(contrato.aumentoFijo);
  }

  return datos;
}

function prepararDatosPropiedad(formulario, catalogos) {
  let idEstadoComercial = formulario.idEstadoComercial;
  let datosContrato = null;

  if (formulario.contratoHabilitado) {
    const estadoContrato = buscarEstadoContrato(formulario.contrato.tipo, catalogos.estados);
    idEstadoComercial = estadoContrato?.id ?? idEstadoComercial;
    datosContrato = prepararDatosContrato(formulario.contrato);
  }

  return {
    nombre: formulario.nombre.trim(),
    idTipo: Number(formulario.idTipo),
    idEstadoComercial: Number(idEstadoComercial),
    idAgente: formulario.idAgente ? Number(formulario.idAgente) : null,
    idPropietario: formulario.idPropietario ? Number(formulario.idPropietario) : null,
    servicios: formulario.servicios,
    datosContrato,
    descripcion: formulario.descripcion.trim() || null,
    ubicacion: formulario.ubicacion.trim() || null,
    habitaciones: Number(formulario.habitaciones),
    banos: Number(formulario.banos),
    tamano: Number(formulario.tamano) > 0 ? Number(formulario.tamano) : null,
    antiguedad: Number(formulario.antiguedad),
    precio: formulario.precio === "" ? null : Number(formulario.precio),
    moneda: formulario.moneda,
    publicada: formulario.publicada,
  };
}

function formularioInicial(propiedad, catalogos) {
  const contrato = propiedad?.datosContrato;
  const estadoContrato = contrato && buscarEstadoContrato(contrato.tipo, catalogos.estados);
  return {
    nombre: propiedad?.nombre || "",
    idTipo: propiedad?.idTipo || catalogos.tipos[0]?.id || "",
    idEstadoComercial: estadoContrato?.id || propiedad?.idEstadoComercial || catalogos.estados[0]?.id || "",
    idAgente: propiedad?.idAgente || "",
    idPropietario: propiedad?.idPropietario || "",
    servicios: propiedad?.servicios || [],
    contratoHabilitado: Boolean(contrato),
    contrato: {
      fechaInicio: contrato?.fechaInicio || "",
      fechaFin: contrato?.fechaFin || "",
      mesesAumento: contrato?.mesesAumento ?? "",
      tipo: contrato?.tipo || "Alquiler",
      estado: contrato?.estado || "Borrador",
      montoInicial: contrato?.montoInicial ?? "",
      tipoAumento: contrato?.tipoAumento || "",
      aumentoFijo: contrato?.aumentoFijo ?? "",
    },
    tituloDocumento: "",
    descripcion: propiedad?.descripcion || "",
    ubicacion: propiedad?.ubicacion || "",
    antiguedad: propiedad?.antiguedad ?? 0,
    habitaciones: propiedad?.habitaciones ?? 0,
    banos: propiedad?.banos ?? 0,
    tamano: propiedad?.tamano ?? "",
    precio: propiedad?.precio ?? "",
    moneda: propiedad?.moneda || "ARS",
    publicada: Boolean(propiedad?.publicada),
    fotos: (propiedad?.imagenes || []).map((imagen) => ({
      ...imagen,
      src: assetUrl(imagen.url),
      alt: `Foto de ${propiedad.nombre}`,
    })),
    documentos: (propiedad?.documentos || []).map((documento) => ({
      ...documento,
      nombreArchivo: documento.nombreArchivo,
      titulo: documento.titulo || documento.nombreArchivo,
    })),
  };
}

function Campo({ label, children, className = "" }) {
  return (
    <label className={`propiedad-modal__field ${className}`}>
      <span className="propiedad-modal__label">{label}</span>
      {children}
    </label>
  );
}

export default function PropiedadModal({ isOpen, mode, propiedad, catalogos, onClose, onSubmit }) {
  const [formulario, setFormulario] = useState(() => formularioInicial(propiedad, catalogos));
  const [section, setSection] = useState("information");
  const [guardando, setGuardando] = useState(false);
  const { isClosing, close } = useClosingTransition(onClose);
  const photoInput = useRef(null);
  const documentInput = useRef(null);
  const objectUrls = useRef([]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event) => {
      if (event.key === "Escape" && !guardando) close();
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [isOpen, close, guardando]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);
  if (!isOpen) return null;

  function actualizarCampo(event) {
    const { name: nombre, value, type, checked } = event.target;
    const valor = type === "checkbox" ? checked : value;

    setFormulario((actual) => {
      const actualizado = { ...actual, [nombre]: valor };

      if (nombre === "idEstadoComercial" && actual.documentos.length === 0) {
        actualizado.contratoHabilitado = false;
        actualizado.contrato = contratoVacio();
      }

      return actualizado;
    });
  }

  function actualizarContrato(event) {
    const { name: nombre, value: valor } = event.target;

    setFormulario((actual) => {
      const contrato = { ...actual.contrato, [nombre]: valor };
      const estadoContrato = buscarEstadoContrato(contrato.tipo, catalogos.estados);

      return {
        ...actual,
        contratoHabilitado: true,
        idEstadoComercial: estadoContrato?.id ?? actual.idEstadoComercial,
        contrato,
      };
    });
  }

  function alternarServicio(id) {
    setFormulario((actual) => {
      let servicios;

      if (actual.servicios.includes(id)) {
        servicios = actual.servicios.filter((idServicio) => idServicio !== id);
      } else {
        servicios = [...actual.servicios, id];
      }

      return { ...actual, servicios };
    });
  }

  function agregarFotos(event) {
    const archivos = Array.from(event.target.files || []);
    const fotos = archivos.map((archivo) => {
      const src = URL.createObjectURL(archivo);
      objectUrls.current.push(src);
      return { archivo, src, alt: archivo.name };
    });

    setFormulario((actual) => ({ ...actual, fotos: [...actual.fotos, ...fotos] }));
    event.target.value = "";
  }

  function agregarDocumentos(event) {
    const archivos = Array.from(event.target.files || []);
    const documentos = archivos.map((archivo) => ({
      archivo,
      nombreArchivo: archivo.name,
      titulo: formulario.tituloDocumento.trim() || archivo.name.replace(/\.pdf$/i, ""),
    }));

    setFormulario((actual) => ({
      ...actual,
      tituloDocumento: "",
      documentos: [...actual.documentos, ...documentos],
    }));
    event.target.value = "";
  }

  function quitarFoto(indice) {
    setFormulario((actual) => ({
      ...actual,
      fotos: actual.fotos.filter((_, i) => i !== indice),
    }));
  }

  function quitarDocumento(indice) {
    setFormulario((actual) => {
      const documentos = actual.documentos.filter((_, i) => i !== indice);
      const actualizado = { ...actual, documentos };

      if (documentos.length === 0) {
        actualizado.contratoHabilitado = false;
        actualizado.contrato = contratoVacio();
      }

      return actualizado;
    });
  }

  function validarFormulario() {
    const contrato = formulario.contrato;
    const fechasInvertidas = contrato.fechaInicio && contrato.fechaFin && contrato.fechaFin < contrato.fechaInicio;

    if (formulario.contratoHabilitado && contrato.tipo === "Alquiler" && fechasInvertidas) {
      setSection("documentation");
      mostrarAviso({ tipo: "error", titulo: "Fechas inválidas", mensaje: "La fecha de fin debe ser posterior al inicio." });
      return false;
    }

    const documentoSinTitulo = formulario.documentos.some((documento) => !documento.titulo.trim());
    if (documentoSinTitulo) {
      setSection("documentation");
      mostrarAviso({ tipo: "error", titulo: "Falta un nombre", mensaje: "Cada documento debe tener un nombre." });
      return false;
    }

    return true;
  }

  async function subirArchivosNuevos(idPropiedad) {
    const fotos = formulario.fotos.filter((foto) => foto.archivo).map((foto) => foto.archivo);
    const documentos = formulario.documentos.filter((documento) => documento.archivo);

    for (let i = 0; i < fotos.length; i += 10) {
      const lote = fotos.slice(i, i + 10);
      await api.subirArchivosPropiedad(idPropiedad, "imagenes", lote);
    }

    for (const documento of documentos) {
      await api.subirArchivosPropiedad(idPropiedad, "documentos", [documento.archivo], documento.titulo.trim());
    }
  }

  async function eliminarArchivosQuitados(idPropiedad) {
    if (!propiedad) return;

    const idsFotosConservadas = new Set(formulario.fotos.map((foto) => foto.id));
    const idsDocumentosConservados = new Set(formulario.documentos.map((documento) => documento.id));

    for (const foto of propiedad.imagenes || []) {
      if (!idsFotosConservadas.has(foto.id)) {
        await api.eliminarArchivoPropiedad(idPropiedad, "imagenes", foto.id);
      }
    }

    for (const documento of propiedad.documentos || []) {
      if (!idsDocumentosConservados.has(documento.id)) {
        await api.eliminarArchivoPropiedad(idPropiedad, "documentos", documento.id);
      }
    }
  }

  async function enviarFormulario(event) {
    event.preventDefault();
    if (!validarFormulario()) return;

    setGuardando(true);
    let propiedadGuardada;

    try {
      const datos = prepararDatosPropiedad(formulario, catalogos);
      if (propiedad) {
        propiedadGuardada = await api.actualizarPropiedad(propiedad.id, datos);
      } else {
        propiedadGuardada = await api.crearPropiedad(datos);
      }

      await subirArchivosNuevos(propiedadGuardada.id);
      await eliminarArchivosQuitados(propiedadGuardada.id);

      const propiedadActualizada = await api.obtenerPropiedad(propiedadGuardada.id);
      await onSubmit(propiedadActualizada);
    } catch (error) {
      if (propiedadGuardada) {
        let propiedadActualizada = propiedadGuardada;
        try {
          propiedadActualizada = await api.obtenerPropiedad(propiedadGuardada.id);
        } catch (errorRecarga) {
          console.error(errorRecarga);
        }
        await onSubmit(propiedadActualizada, error.message);
      } else {
        mostrarAviso({
          tipo: "error",
          titulo: propiedad ? "No se pudo actualizar la propiedad" : "No se pudo crear la propiedad",
          mensaje: error.message,
        });
      }
    } finally {
      setGuardando(false);
    }
  }

  return createPortal(
    <div
      className={`propiedad-modal__overlay${isClosing ? " is-closing" : ""}`}
      aria-hidden={isClosing}
      inert={isClosing}
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget && !guardando) close(); }}
    >
      <section
        className={`propiedad-modal${isClosing ? " is-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="propiedad-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="propiedad-modal__header">
          <div>
            <h2 id="propiedad-modal-title">
              {mode === "edit" ? "Editar propiedad" : "Crear propiedad"}
            </h2>
            <p>Los cambios se guardan en la inmobiliaria.</p>
          </div>
          <div
            className="propiedad-modal__tabs"
            role="tablist"
            aria-label="Secciones de la propiedad"
          >
            <Boton
              type="button"
              role="tab"
              aria-selected={section === "information"}
              className={section === "information" ? "is-active" : ""}
              onClick={() => setSection("information")}
            >
              Información
            </Boton>
            <Boton
              type="button"
              role="tab"
              aria-selected={section === "documentation"}
              className={section === "documentation" ? "is-active" : ""}
              onClick={() => setSection("documentation")}
            >
              Documentación
            </Boton>
          </div>
        </header>
        <form onSubmit={enviarFormulario}>
          {section === "information" ? (
            <div className="propiedad-modal__information" role="tabpanel" aria-label="Información">
              <div className="propiedad-modal__column propiedad-modal__column--main">
                <section className="propiedad-modal__card propiedad-modal__card--main">
                  <div className="propiedad-modal__card-heading">
                    <span>1</span>
                    <h3>Datos principales</h3>
                  </div>
                  <div className="propiedad-modal__card-body propiedad-modal__main-fields">
                    <Campo label="Nombre">
                      <input
                        className="propiedad-modal__plain-input"
                        name="nombre"
                        value={formulario.nombre}
                        onChange={actualizarCampo}
                        placeholder="Nombre de la propiedad"
                      />
                    </Campo>
                    <Campo label="Tipo">
                      <select
                        className="propiedad-modal__plain-input"
                        name="idTipo"
                        value={formulario.idTipo}
                        onChange={actualizarCampo}
                      >
                        {catalogos.tipos.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.nombre}
                          </option>
                        ))}
                      </select>
                    </Campo>
                    <Campo label="Descripción" className="propiedad-modal__field--full">
                      <div className="propiedad-modal__textarea-wrap">
                        <textarea
                          name="descripcion"
                          value={formulario.descripcion}
                          onChange={actualizarCampo}
                          placeholder="Descripción de la propiedad"
                        />
                        <span>{formulario.descripcion.length}</span>
                      </div>
                    </Campo>
                    <Campo label="Ubicación">
                      <span className="propiedad-modal__input-wrap">
                        <img src={locationDotIcon} alt="" />
                        <input name="ubicacion" value={formulario.ubicacion} onChange={actualizarCampo} placeholder="Ubicación de la propiedad" />
                      </span>
                    </Campo>
                    <Campo label="Dueño / Propietario">
                      <span className="propiedad-modal__input-wrap">
                        <img src={userIcon} alt="" />
                        <select name="idPropietario" value={formulario.idPropietario} onChange={actualizarCampo} aria-label="Dueño o propietario">
                          <option value="">Sin asignar</option>
                          {(catalogos.propietarios || []).map((propietario) => (
                            <option key={propietario.id} value={propietario.id}>{propietario.nombre}</option>
                          ))}
                        </select>
                      </span>
                    </Campo>
                    <Campo label="Agente">
                      <select
                        className="propiedad-modal__plain-input"
                        name="idAgente"
                        value={formulario.idAgente}
                        onChange={actualizarCampo}
                      >
                        <option value="">Sin asignar</option>
                        {catalogos.agentes.map((agente) => (
                          <option key={agente.id} value={agente.id}>
                            {agente.nombre}
                          </option>
                        ))}
                      </select>
                    </Campo>
                  </div>
                </section>
                <section className="propiedad-modal__card propiedad-modal__card--photos">
                  <div className="propiedad-modal__card-heading">
                    <span>4</span>
                    <h3>Fotos de la propiedad</h3>
                  </div>
                  <div className="propiedad-modal__photos-body">
                    <div className="propiedad-modal__photos-list">
                      {formulario.fotos.map((foto, index) => (
                        <figure className="propiedad-modal__photo" key={foto.id || foto.src}>
                          <img src={foto.src} alt={foto.alt} />
                          <button
                            type="button"
                            aria-label={`Quitar foto ${index + 1}`}
                            onClick={() => quitarFoto(index)}
                          >
                            ×
                          </button>
                        </figure>
                      ))}
                      <button
                        className="propiedad-modal__add-photo"
                        type="button"
                        onClick={() => photoInput.current?.click()}
                      >
                        <img src={plusIcon} alt="" />
                        <span>Agregar fotos</span>
                      </button>
                    </div>
                    <input
                      ref={photoInput}
                      className="propiedad-modal__hidden-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={agregarFotos}
                    />
                  </div>
                </section>
              </div>
              <div className="propiedad-modal__column propiedad-modal__column--side">
                <section className="propiedad-modal__card propiedad-modal__card--features">
                  <div className="propiedad-modal__card-heading">
                    <span>2</span>
                    <h3>Características</h3>
                  </div>
                  <div className="propiedad-modal__card-body propiedad-modal__feature-grid">
                    {[
                      ["Antigüedad", "antiguedad", calendarIcon],
                      ["Habitaciones", "habitaciones", bedIcon],
                      ["Superficie (m²)", "tamano", rulerCombinedIcon],
                      ["Baños", "banos", bathIcon],
                    ].map(([label, nombre, icon]) => (
                      <Campo label={label} key={nombre}>
                        <span className="propiedad-modal__input-wrap propiedad-modal__input-wrap--counter">
                          <img src={icon} alt="" />
                          <input
                            type="number"
                            min="0"
                            step={nombre === "tamano" ? "0.01" : "1"}
                            name={nombre}
                            value={formulario[nombre]}
                            placeholder={nombre === "tamano" ? "0" : undefined}
                            onChange={actualizarCampo}
                          />
                        </span>
                      </Campo>
                    ))}
                  </div>
                </section>
                <section className="propiedad-modal__card propiedad-modal__card--commercial">
                  <div className="propiedad-modal__card-heading">
                    <span>3</span>
                    <h3>Comercialización</h3>
                  </div>
                  <div className="propiedad-modal__card-body propiedad-modal__feature-grid">
                    <Campo label="Estado">
                      <select
                        className="propiedad-modal__plain-input"
                        name="idEstadoComercial"
                        value={formulario.idEstadoComercial}
                        onChange={actualizarCampo}
                        disabled={formulario.contratoHabilitado && formulario.documentos.length > 0}
                        title={formulario.contratoHabilitado && formulario.documentos.length > 0 ? "El estado se define por el tipo de contrato" : undefined}
                      >
                        {catalogos.estados.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.nombre}
                          </option>
                        ))}
                      </select>
                    </Campo>
                    <Campo label="Precio">
                      <input
                        className="propiedad-modal__plain-input"
                        type="number"
                        min="0"
                        step="0.01"
                        name="precio"
                        value={formulario.precio}
                        placeholder="0"
                        onChange={actualizarCampo}
                      />
                    </Campo>
                    <Campo label="Moneda">
                      <select
                        className="propiedad-modal__plain-input"
                        name="moneda"
                        value={formulario.moneda}
                        onChange={actualizarCampo}
                      >
                        <option value="ARS">ARS</option>
                        <option value="USD">USD</option>
                      </select>
                    </Campo>
                    <Campo label="Publicada">
                      <input
                        type="checkbox"
                        name="publicada"
                        checked={formulario.publicada}
                        onChange={actualizarCampo}
                      />
                    </Campo>
                  </div>
                </section>
              </div>
              <section className="propiedad-modal__card propiedad-modal__card--services">
                <div className="propiedad-modal__card-heading">
                  <span>5</span>
                  <h3>Servicios</h3>
                </div>
                <div className="propiedad-modal__card-body propiedad-modal__services-grid">
                  {(catalogos.servicios || []).map((service) => {
                    const icon = {
                      Agua: dropletIcon, Gas: fireFlameSimpleIcon,
                      Luz: boltIcon, Estacionamiento: carIcon
                    }[service.nombre];
                    const checked = formulario.servicios.includes(service.id);
                    return (
                      <label className={`propiedad-modal__service${checked ? " is-checked" : ""}${icon ? "" : " no-icon"}`} key={service.id}>
                        <input type="checkbox" checked={checked} onChange={() => alternarServicio(service.id)} />
                        <span className="propiedad-modal__fake-checkbox" aria-hidden="true" />
                        {icon && <img src={icon} alt="" />}
                        <span>{service.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : (
            <div className="propiedad-modal__documentation" role="tabpanel" aria-label="Documentación">
              <section className="propiedad-modal__card">
                <div className="propiedad-modal__card-heading">
                  <span>1</span>
                  <h3>Datos principales del contrato</h3>
                </div>
                <div className="propiedad-modal__card-body propiedad-modal__contract-grid">
                  <p className="propiedad-modal__contract-note">Estos datos se guardan como borrador de la propiedad hasta completar el contrato con sus participantes.</p>
                  <Campo label="Tipo">
                    <select className="propiedad-modal__plain-input" name="tipo" value={formulario.contrato.tipo} onChange={actualizarContrato}>
                      <option value="Alquiler">Alquiler</option>
                      <option value="Venta">Venta</option>
                    </select>
                  </Campo>
                  {formulario.contrato.tipo === "Alquiler" && (
                    <>
                      <Campo label="Fecha inicio">
                        <input className="propiedad-modal__plain-input" type="date" name="fechaInicio" value={formulario.contrato.fechaInicio} onChange={actualizarContrato} />
                      </Campo>
                      <Campo label="Fecha fin">
                        <input className="propiedad-modal__plain-input" type="date" name="fechaFin" min={formulario.contrato.fechaInicio || undefined} value={formulario.contrato.fechaFin} onChange={actualizarContrato} />
                      </Campo>
                      <Campo label="Meses de aumento">
                        <input className="propiedad-modal__plain-input" type="number" min="1" max="120" name="mesesAumento" value={formulario.contrato.mesesAumento} onChange={actualizarContrato} />
                      </Campo>
                      <Campo label="Estado">
                        <select className="propiedad-modal__plain-input" name="estado" value={formulario.contrato.estado} onChange={actualizarContrato}>
                          <option value="Borrador">Borrador</option>
                          <option value="Vigente">Activo</option>
                          <option value="Finalizado">Finalizado</option>
                        </select>
                      </Campo>
                      <Campo label="Monto inicial acordado">
                        <input className="propiedad-modal__plain-input" type="number" min="0" step="0.01" name="montoInicial" value={formulario.contrato.montoInicial} onChange={actualizarContrato} />
                      </Campo>
                      <Campo label="Tipo de aumento">
                        <select className="propiedad-modal__plain-input" name="tipoAumento" value={formulario.contrato.tipoAumento} onChange={actualizarContrato}>
                          <option value="">Sin aumento</option>
                          <option value="FIJO">Fijo</option>
                          <option value="INDEC">INDEC</option>
                        </select>
                      </Campo>
                      <Campo label="Aumento fijo">
                        <input className="propiedad-modal__plain-input" type="number" min="0" step="0.01" name="aumentoFijo"
                          value={formulario.contrato.aumentoFijo} onChange={actualizarContrato} disabled={formulario.contrato.tipoAumento !== "FIJO"} />
                      </Campo>
                    </>
                  )}
                </div>
              </section>
              <section className="propiedad-modal__card propiedad-modal__card--documents">
                <div className="propiedad-modal__card-heading">
                  <span>2</span>
                  <h3>Documentación</h3>
                </div>
                <div className="propiedad-modal__card-body propiedad-modal__documents-body">
                  <div className="propiedad-modal__document-add-row">
                    <button className="propiedad-modal__add-document" type="button" onClick={() => documentInput.current?.click()}>
                      <img src={plusIcon} alt="" />
                      <span>Agregar archivo</span>
                    </button>
                    <Campo label="Nombre" className="propiedad-modal__document-name">
                      <input className="propiedad-modal__plain-input" maxLength={255} name="tituloDocumento"
                        value={formulario.tituloDocumento} onChange={actualizarCampo} placeholder="Contrato de alquiler" />
                    </Campo>
                  </div>
                  {formulario.documentos.map((doc, index) => (
                    <div
                      className="propiedad-modal__document-row"
                      key={doc.id || `${doc.nombreArchivo}-${index}`}
                    >
                      <span title={doc.nombreArchivo}>{doc.nombreArchivo}</span>
                      <button
                        className="propiedad-modal__remove-document"
                        type="button"
                        aria-label={`Quitar documento ${index + 1}`}
                        onClick={() => quitarDocumento(index)}
                      >
                        <img src={xIcon} alt="" />
                      </button>
                    </div>
                  ))}
                  <input
                    ref={documentInput}
                    className="propiedad-modal__hidden-input"
                    type="file"
                    accept="application/pdf"
                    onChange={agregarDocumentos}
                  />
                </div>
              </section>
            </div>
          )}
          <footer className="propiedad-modal__actions">
            <button
              className="propiedad-modal__cancel"
              type="button"
              disabled={guardando}
              onClick={close}
            >
              Cancelar
            </button>
            <Boton
              className="propiedad-modal__submit"
              type="submit"
              disabled={guardando}
              text={
                guardando ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Crear propiedad"
              }
            />
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
