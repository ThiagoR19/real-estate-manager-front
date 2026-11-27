import { assetUrl } from "../../utils/assetUrl.js";
import { useEffect, useMemo, useState } from "react";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import { calendarIcon, envelopeIcon, fileLinesIcon, houseIcon, locationDotIcon, magnifyingGlassIcon, peopleIcon, phoneIcon, plusIcon, xIcon } from "../../assets/icons";
import { SelectDesplegable, ConfirmarEliminacionModal, AccionesEntidad, AvisoEnlaceActivacion, Boton, PildoraResumen, Paginacion, usePaginacion, mostrarAviso } from "../../components";
import InquilinoModal from "./InquilinoModal";
import "./Inquilinos.css";
import { api } from "../../services/api.js";

import avatarClass from "../../utils/avatarClass";
import initials from "../../utils/initials.js";

const definicionesFiltros = [
  { label: "Propiedad", icon: houseIcon, all: "Todas las propiedades" },
  { label: "Estado", icon: locationDotIcon, all: "Todos los estados" },
  { label: "Vencimiento", icon: calendarIcon, all: "Todos los vencimientos" },
];

const opcionesEstado = ["Todos los estados", "Activo", "Inactivo"];
const opcionesVencimiento = ["Todos los vencimientos", "Este mes", "Próximos 30 días"];

function interpretarFecha(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function enlaceActivacion(activacion) {
  if (activacion?.enlace) return activacion.enlace;
  return activacion?.codigo
    ? `${window.location.origin}/activar?codigo=${encodeURIComponent(activacion.codigo)}`
    : "";
}

function formatearFecha(value) {
  const date = interpretarFecha(value);
  return date
    ? date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
}

function venceEnPlazo(value, days, today = new Date()) {
  const date = interpretarFecha(value);
  if (!date) return false;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return date >= start && date <= end;
}

function coincideVencimiento(inquilino, selected, today) {
  if (selected === opcionesVencimiento[0]) return true;
  if (inquilino.estadoContrato !== "Vigente") return false;
  const date = interpretarFecha(inquilino.fechaFin);
  if (!date) return false;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (selected === opcionesVencimiento[1]) {
    return (
      date >= start &&
      date.getFullYear() === start.getFullYear() &&
      date.getMonth() === start.getMonth()
    );
  }
  return venceEnPlazo(date, 30, start);
}

function ControlFiltro({ filter, value, onChange }) {
  return (
    <SelectDesplegable
      label={filter.label}
      placeholder={filter.label}
      value={value}
      options={filter.options}
      onChange={onChange}
      icon={filter.icon}
      className="inquilinos__filter"
      triggerClassName="inquilinos__filter-trigger"
      iconClassName="inquilinos__filter-icon"
      chevronClassName="inquilinos__filter-chevron"
    />
  );
}

function ImagenPropiedad({ src }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="inquilinos__propiedad-image inquilinos__propiedad-image--empty" aria-hidden="true">
        <img src={houseIcon} alt="" />
      </div>
    );
  }

  return <img className="inquilinos__propiedad-image" src={src} alt="" onError={() => setFailed(true)} />;
}

function FilaInquilino({ inquilino, imagenesPropiedades, onEdit, onDelete, onGenerateActivation }) {
  const nombre = `${inquilino.nombre || ""} ${inquilino.apellido || ""}`.trim() || `DNI ${inquilino.dni}`;
  const status = inquilino.activo ? "Activo" : "Inactivo";
  const propertyImageUrl = imagenesPropiedades[inquilino.idPropiedad];
  return (
    <tr>
      <td data-label="Inquilino">
        <div className="inquilinos__person">
          <span className={`inquilinos__avatar ${avatarClass(inquilino.nombre, inquilino.apellido)}`}>
            {initials(inquilino.nombre, inquilino.apellido)}
          </span>
          <span className="inquilinos__person-copy">
            <strong>{nombre}</strong>
            <small>DNI {inquilino.dni || "—"}</small>
          </span>
        </div>
      </td>
      <td data-label="Contacto">
        <div className="inquilinos__contact">
          <span>
            <img src={envelopeIcon} alt="" />
            <span className="inquilinos__contact-text" title={inquilino.correo || "Correo sin especificar"}>
              {inquilino.correo || "Correo sin especificar"}
            </span>
          </span>
          <span>
            <img src={phoneIcon} alt="" />
            <span className="inquilinos__contact-text" title={inquilino.telefono || "Teléfono sin especificar"}>
              {inquilino.telefono || "Teléfono sin especificar"}
            </span>
          </span>
        </div>
      </td>
      <td data-label="Propiedad">
        <div className="inquilinos__propiedad">
          <ImagenPropiedad key={propertyImageUrl || "sin-imagen"} src={propertyImageUrl} />
          <span>
            <strong>{inquilino.propiedad || "Sin propiedad asignada"}</strong>
            <small>{inquilino.propiedadUbicacion || "Sin ubicación de propiedad"}</small>
          </span>
        </div>
      </td>
      <td data-label="Contrato">
        <span className="inquilinos__contract">
          <strong>{inquilino.idContrato ? `Contrato #${inquilino.idContrato}` : "Sin contrato"}</strong>
          <small>
            {inquilino.idContrato
              ? `${formatearFecha(inquilino.fechaInicio)} – ${formatearFecha(inquilino.fechaFin)}`
              : "Sin contrato vigente"}
          </small>
        </span>
      </td>
      <td data-label="Estado">
        <span
          className={`inquilinos__status inquilinos__status--${inquilino.activo ? "active" : "inactive"}`}
        >
          {status}
        </span>
      </td>
      <td data-label="Próximo vencimiento">
        <strong className="inquilinos__due">
          {inquilino.estadoContrato === "Vigente" ? formatearFecha(inquilino.fechaFin) : "—"}
        </strong>
      </td>
      <td data-label="Acciones" className="inquilinos__actions-cell">
        <AccionesEntidad
          entidad="inquilino"
          nombre={nombre}
          onEdit={() => onEdit(inquilino)}
          onDelete={() => onDelete(inquilino)}
          onGenerateActivation={
            inquilino.estadoCuenta === "PENDIENTE_ACTIVACION"
              ? () => onGenerateActivation(inquilino)
              : undefined
          }
        />
      </td>
    </tr>
  );
}

export default function Inquilinos() {
  const [inquilinos, setInquilinos] = useState([]);
  const [imagenesPropiedades, setPropertyImages] = useState({});
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [valoresFiltros, setValoresFiltros] = useState(definicionesFiltros.map((filter) => filter.all));
  const [modal, setModal] = useState({ isOpen: false, mode: "create", inquilino: null });
  const [aviso, setAviso] = useState("");
  const [enlaceActivacionGenerado, setEnlaceActivacion] = useState("");
  const [loadError, setLoadError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [pendienteEliminar, setPendienteEliminar] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function cargarInquilinos() {
      setCargando(true);
      setLoadError("");
      try {
        const [tenantResult, propertyResult] = await Promise.allSettled([api.inquilinos(), api.propiedades()]);
        if (tenantResult.status === "rejected") throw tenantResult.reason;
        if (!mounted) return;
        setInquilinos(tenantResult.value);
        if (propertyResult.status === "fulfilled") {
          setPropertyImages(Object.fromEntries(propertyResult.value
            .filter((propiedad) => propiedad.imagenes?.[0]?.url)
            .map((propiedad) => [propiedad.id, assetUrl(propiedad.imagenes[0].url)])));
        } else {
          mostrarAviso({
            tipo: "advertencia",
            titulo: "No se pudieron cargar las imágenes de propiedades",
            mensaje: propertyResult.reason?.message || "Las imágenes no están disponibles en este momento.",
          });
        }
      } catch (error) {
        if (mounted) {
          setLoadError(error.message || "No se pudieron cargar los inquilinos.");
          mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar los inquilinos", mensaje: error.message });
        }
      } finally {
        if (mounted) setCargando(false);
      }
    }
    cargarInquilinos();
    return () => {
      mounted = false;
    };
  }, []);

  const filterControls = useMemo(() => {
    const opcionesPropiedad = [
      ...new Set(inquilinos.map((inquilino) => inquilino.propiedad).filter(Boolean)),
    ].sort((first, second) => first.localeCompare(second, "es"));
    return [
      { ...definicionesFiltros[0], options: [definicionesFiltros[0].all, ...opcionesPropiedad] },
      { ...definicionesFiltros[1], options: opcionesEstado },
      { ...definicionesFiltros[2], options: opcionesVencimiento },
    ];
  }, [inquilinos]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Inquilinos activos",
        value: inquilinos.filter((inquilino) => inquilino.activo).length,
        icon: peopleIcon,
        tone: "success",
      },
      {
        label: "Inquilinos inactivos",
        value: inquilinos.filter((inquilino) => !inquilino.activo).length,
        icon: xIcon,
        tone: "warning",
      },
      {
        label: "Contratos vigentes",
        value: inquilinos.filter((inquilino) => inquilino.estadoContrato === "Vigente").length,
        icon: fileLinesIcon,
        tone: "info",
      },
      {
        label: "Vencen en 30 días",
        value: inquilinos.filter(
          (inquilino) => inquilino.estadoContrato === "Vigente" && venceEnPlazo(inquilino.fechaFin, 30),
        ).length,
        icon: calendarIcon,
        tone: "danger",
      },
    ],
    [inquilinos],
  );

  const inquilinosVisibles = useMemo(() => {
    const busquedaNormalizada = textoBusqueda.trim().toLocaleLowerCase("es");
    const today = new Date();
    return inquilinos.filter((inquilino) => {
      const searchable = [
        inquilino.nombre,
        inquilino.apellido,
        inquilino.dni,
        inquilino.correo,
        inquilino.telefono,
        inquilino.direccion,
        inquilino.propiedad,
        inquilino.propiedadUbicacion,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase("es")
          .includes(busquedaNormalizada),
      );
      const matchesQuery = !busquedaNormalizada || searchable;
      const matchesProperty =
        valoresFiltros[0] === definicionesFiltros[0].all || inquilino.propiedad === valoresFiltros[0];
      const status = inquilino.activo ? "Activo" : "Inactivo";
      const matchesStatus = valoresFiltros[1] === opcionesEstado[0] || status === valoresFiltros[1];
      const matchesDate = coincideVencimiento(inquilino, valoresFiltros[2], today);
      return matchesQuery && matchesProperty && matchesStatus && matchesDate;
    });
  }, [valoresFiltros, textoBusqueda, inquilinos]);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(inquilinosVisibles);

  async function confirmarEliminacionInquilino() {
    if (!pendienteEliminar) return;
    try {
      await api.eliminarInquilino(pendienteEliminar.id);
      setInquilinos((current) => current.filter((inquilino) => inquilino.id !== pendienteEliminar.id));
      mostrarAviso({
        tipo: "exito",
        titulo: "Inquilino eliminado",
        mensaje: `${`${pendienteEliminar.nombre || ""} ${pendienteEliminar.apellido || ""}`.trim() || `DNI ${pendienteEliminar.dni}`} fue eliminado.`,
      });
      setAviso("");
      setEnlaceActivacion("");
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo eliminar el inquilino", mensaje: error.message });
    } finally {
      setPendienteEliminar(null);
    }
  }

  async function generarEnlaceActivacion(inquilino) {
    try {
      const activacion = await api.generarEnlaceInquilino(inquilino.id);
      const titular = `${inquilino.nombre || ""} ${inquilino.apellido || ""}`.trim() || `DNI ${inquilino.dni}`;
      setEnlaceActivacion(enlaceActivacion(activacion));
      setAviso(`Enlace nuevo para ${titular}. Compartilo con el inquilino para activar su cuenta.`);
      mostrarAviso({ tipo: "info", titulo: "Enlace de activación generado", mensaje: "Copialo y compartilo con el inquilino para que active su cuenta." });
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo generar el enlace", mensaje: error.message });
    }
  }

  function abrirModalCreacion() {
    setModal({ isOpen: true, mode: "create", inquilino: null });
  }

  function editarInquilino(inquilino) {
    setModal({ isOpen: true, mode: "edit", inquilino });
  }

  function cerrarModalInquilino() {
    setModal((current) => ({ ...current, isOpen: false }));
  }

  async function guardarInquilino(formulario) {
    const existing = modal.mode === "edit" ? modal.inquilino : null;
    const body = {
      nombre: formulario.nombre || null,
      apellido: formulario.apellido || null,
      dni: formulario.dni || null,
      correo: formulario.correo || null,
      telefono: formulario.telefono || null,
      direccion: formulario.direccion || null,
    };
    const raw = existing
      ? await api.actualizarInquilino(existing.id, {
          ...body,
          dni: undefined,
          activo: formulario.activo,
          ...(formulario.idPropiedad && Number(formulario.idPropiedad) !== Number(existing.idPropiedad)
            ? { idPropiedad: Number(formulario.idPropiedad) }
            : {}),
        })
      : await api.crearInquilino(body);
    const result = { inquilino: raw, activationUrl: enlaceActivacion(raw.activacion) };
    setInquilinos((current) =>
      existing
        ? current.map((inquilino) => (inquilino.id === existing.id ? result.inquilino : inquilino))
        : [result.inquilino, ...current],
    );
    const titular = `${raw.nombre || ""} ${raw.apellido || ""}`.trim() || `DNI ${raw.dni}`;
    setAviso(!existing && result.activationUrl
      ? `Se creó el acceso de ${titular}. Compartí el enlace con su titular.`
      : "");
    setEnlaceActivacion(result.activationUrl || "");
    mostrarAviso({
      tipo: "exito",
      titulo: existing ? "Inquilino actualizado" : "Inquilino creado",
      mensaje: existing ? `Se actualizó la información de ${titular}.` : `Se creó el acceso de ${titular}.`,
    });
    cerrarModalInquilino();
  }

  function actualizarFiltro(index, value) {
    resetPage();
    setValoresFiltros((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  if (cargando) return <PageSkeleton variant="table" title="inquilinos" />;

  return (
    <main id="inquilinos">
      <div className="inquilinos__page">
        <section className="inquilinos__overview" aria-labelledby="inquilinos-title">
          <div className="inquilinos__hero">
            <h1 id="inquilinos-title">Inquilinos</h1>
            <p>Gestiona la información de todos los inquilinos</p>
          </div>
          <div className="inquilinos__summary" aria-label="Resumen de inquilinos">
            {summaryCards.map((card) => (
              <PildoraResumen key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className="inquilinos__toolbar" aria-label="Buscar y filtrar inquilinos">
          <label className="inquilinos__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input
              type="search"
              placeholder="Buscar contacto..."
              aria-label="Buscar contacto"
              value={textoBusqueda}
              onChange={(event) => { setTextoBusqueda(event.target.value); resetPage(); }}
            />
          </label>
          {filterControls.map((filter, index) => (
            <ControlFiltro
              key={filter.label}
              filter={filter}
              value={valoresFiltros[index] || filter.options[0]}
              onChange={(value) => actualizarFiltro(index, value)}
            />
          ))}
          <Boton
            className="inquilinos__new-button"
            onClick={abrirModalCreacion}
            icon={plusIcon}
            text="Nuevo inquilino"
          />
        </section>

        <section className="inquilinos__table-card" aria-label="Listado de inquilinos">
          <div className="inquilinos__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inquilino</th>
                  <th>Contacto</th>
                  <th>Propiedad</th>
                  <th>Contrato</th>
                  <th>Estado</th>
                  <th>Próximo vencimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((inquilino) => (
                  <FilaInquilino
                    key={inquilino.id}
                    inquilino={inquilino}
                    imagenesPropiedades={imagenesPropiedades}
                    onEdit={editarInquilino}
                    onDelete={setPendienteEliminar}
                    onGenerateActivation={generarEnlaceActivacion}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {loadError && (
            <p className="inquilinos__empty" role="alert">
              {loadError}
            </p>
          )}
          {!loadError && !inquilinosVisibles.length && (
            <p className="inquilinos__empty">No encontramos inquilinos con esos criterios.</p>
          )}
          <Paginacion page={page} totalPages={totalPages} total={inquilinosVisibles.length} onPageChange={setPage} />
        </section>
      </div>

      {aviso && (
        <AvisoEnlaceActivacion
          message={aviso}
          url={enlaceActivacionGenerado}
          onDismiss={() => { setAviso(""); setEnlaceActivacion(""); }}
        />
      )}

      <ConfirmarEliminacionModal
        isOpen={Boolean(pendienteEliminar)}
        onClose={() => setPendienteEliminar(null)}
        onConfirm={confirmarEliminacionInquilino}
        title="¿Eliminar este inquilino? Se quitará su acceso y se conservará el historial de contratos, pagos y reportes."
      />

      {modal.isOpen && (
        <InquilinoModal
          isOpen={modal.isOpen}
          mode={modal.mode}
          inquilino={modal.inquilino}
          onClose={cerrarModalInquilino}
          onSubmit={guardarInquilino}
        />
      )}
    </main>
  );
}
