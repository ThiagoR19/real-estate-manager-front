import { assetUrl } from "../../utils/assetUrl.js";
import { obtenerSesion, guardarSesion } from "../../utils/sesion.js";
import { memo, useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { addressCardIcon, cameraIcon, checkIcon, envelopeIcon, eyeIcon, eyeSlashIcon, locationDotIcon, lockIcon, phoneIcon, trashCanIcon, userIcon, infoToastIcon } from "../../assets/icons";
import "./Perfil.css";
import { Boton, mostrarAviso } from "../../components";
import { api } from "../../services/api.js";
import initials from "../../utils/initials.js";
import avatarClass from "../../utils/avatarClass.js";

const personalFields = [
  { id: "nombre", label: "Nombre", icon: userIcon },
  { id: "apellido", label: "Apellido", icon: userIcon },
  { id: "telefono", label: "Teléfono", icon: phoneIcon },
  { id: "correo", label: "Correo", icon: envelopeIcon },
  { id: "direccion", label: "Dirección", icon: locationDotIcon },
];

const passwordFields = [
  {
    id: "current-password",
    label: "Contraseña actual",
    placeholder: "Ingresa tu contraseña actual",
  },
  { id: "new-password", label: "Nueva contraseña", placeholder: "Ingresa una nueva contraseña" },
  {
    id: "confirm-password",
    label: "Confirmar nueva contraseña",
    placeholder: "Repite la nueva contraseña",
  },
];

const Campo = memo(function Campo({ field, placeholder }) {
  return (
    <label className="perfil__field" htmlFor={field.id}>
      <span className="perfil__field-label">{field.label}</span>
      <span className="perfil__field-control">
        <img className="perfil__field-icon" src={field.icon} alt="" />
        <input id={field.id} name={field.id} placeholder={placeholder} required={field.required} />
      </span>
    </label>
  );
});

const CampoSoloLectura = memo(function CampoSoloLectura({ field, value }) {
  return (
    <div className="perfil__field">
      <span className="perfil__field-label" id={`${field.id}-label`}>{field.label}</span>
      <span
        className="perfil__field-control perfil__field-control--readonly"
        role="group"
        aria-labelledby={`${field.id}-label`}
        title="El DNI no se puede modificar"
      >
        <img className="perfil__field-icon" src={field.icon} alt="" />
        <span className="perfil__readonly-value">{value || "No informado"}</span>
        <span className="perfil__readonly-note">No editable</span>
      </span>
    </div>
  );
});

const CampoContrasena = memo(function CampoContrasena({ field, visible, onToggle }) {
  return (
    <label className="perfil__field" htmlFor={field.id}>
      <span className="perfil__field-label">
        {field.label}
        {field.required && <b aria-hidden="true">*</b>}
      </span>
      <span className="perfil__field-control perfil__field-control--password">
        <input
          id={field.id}
          name={field.id}
          type={visible ? "text" : "password"}
          placeholder={field.placeholder}
          required={field.required}
        />
        <button
          className="perfil__password-toggle"
          type="button"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          onClick={() => onToggle(field.id)}
        >
          <img src={visible ? eyeIcon : eyeSlashIcon} alt="" aria-hidden="true" />
        </button>
      </span>
    </label>
  );
});

export default function Perfil() {
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState({});
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, navigate] = useLocation();

  const showProfile = useCallback((updated, token) => {
    setProfile(updated);
    setPhotoLoadError(false);
    const session = obtenerSesion();
    if (session)
      guardarSesion({
        ...session,
        token: token || session.token,
        usuario: {
          ...session.usuario,
          nombre: updated.nombre,
          apellido: updated.apellido,
          urlFotoPerfil: updated.urlFotoPerfil,
        },
      });
  }, []);

  const togglePassword = useCallback((id) => {
    setVisiblePasswords((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  async function cerrarSesion() {
    setLoggingOut(true);
    try {
      await api.cerrarSesion();
      navigate("/login");
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo cerrar la sesión", mensaje: error.message });
      setLoggingOut(false);
    }
  }

  const enviarFormulario = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSaving(true);

    const values = Object.fromEntries(new FormData(form));

    const payload = Object.fromEntries(personalFields.map(({ id }) => [id, String(values[id] ?? "").trim()]).filter(([, value]) => value !== ""),);

    const contraseñaActual = values["current-password"];
    const contraseñaNueva = values["new-password"];
    const confirmarContraseña = values["confirm-password"];

    try {
      if (Object.keys(payload).length > 0) {
        const result = await api.actualizarPerfil(payload);
        showProfile(result.perfil, result.token);
      }
      if (contraseñaActual || contraseñaNueva || confirmarContraseña) {
        await api.actualizarContrasena({
          actual: contraseñaActual,
          nueva: contraseñaNueva,
          confirmacion: confirmarContraseña,
        });
        setProfile((current) => ({ ...current, tieneContrasena: 1 }));
      }
      if (
        Object.keys(payload).length > 0 ||
        contraseñaActual ||
        contraseñaNueva ||
        confirmarContraseña
      ) {
        form.reset();
        mostrarAviso({ tipo: "exito", titulo: "Cambios guardados", mensaje: "La información de tu perfil se actualizó correctamente." });
      }
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudieron guardar los cambios", mensaje: error.message || "Intentá nuevamente." });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (event) => {
    const input = event.currentTarget;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) {
      mostrarAviso({ tipo: "advertencia", titulo: "Formato no permitido", mensaje: "Elegí una imagen JPEG, PNG o WebP." });
      input.value = "";
      return;
    }

    if (archivo.size > 2 * 1024 * 1024) {
      mostrarAviso({ tipo: "advertencia", titulo: "Imagen muy pesada", mensaje: "La imagen no puede superar los 2 MiB." });
      input.value = "";
      return;
    }

    setPhotoUploading(true);
    try {
      showProfile(await api.actualizarFotoPerfil(archivo));
      mostrarAviso({ tipo: "exito", titulo: "Foto actualizada", mensaje: "Tu foto de perfil se actualizó correctamente." });
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo subir la foto", mensaje: error.message || "Intentá nuevamente." });
    } finally {
      setPhotoUploading(false);
      input.value = "";
    }
  };

  useEffect(() => {
    let mounted = true;

    async function cargarPerfil() {
      try {
        const loadedProfile = await api.perfil();
        if (mounted) showProfile(loadedProfile ?? {});
      } catch (error) {
        if (mounted) mostrarAviso({ tipo: "error", titulo: "No se pudo cargar el perfil", mensaje: error.message });
      }
    }

    cargarPerfil();
    return () => {
      mounted = false;
    };
  }, [showProfile]);

  const iniciales = initials(profile.nombre, profile.apellido);
  const profilePhotoUrl = profile.urlFotoPerfil && !photoLoadError ? assetUrl(profile.urlFotoPerfil) : "";
  const cuentaGoogleSinContrasena = Number(profile.googleVinculado) === 1 && Number(profile.tieneContrasena) !== 1;

  return (
    <main id="perfil">
      <div className="perfil__layout">
        <aside className="perfil__sidebar">
          <section className="perfil__identity-card" aria-label="Resumen del perfil">
            <div className={`perfil__avatar ${avatarClass(profile.nombre, profile.apellido)}`}>
              {profilePhotoUrl ? (
                <img
                  className="perfil__avatar-photo"
                  src={profilePhotoUrl}
                  alt={`Foto de perfil de ${profile.nombre ?? ""} ${profile.apellido ?? ""}`.trim()}
                  onError={() => {
                    setPhotoLoadError(true);
                    mostrarAviso({ tipo: "error", titulo: "No se pudo cargar la foto", mensaje: "Podés elegir otra imagen desde tu perfil." });
                  }}
                />
              ) : (
                <span>{iniciales}</span>
              )}
              <label className={`perfil__avatar-upload${photoUploading ? " is-uploading" : ""}`}>
                <img src={cameraIcon} alt="" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-label={photoUploading ? "Subiendo foto de perfil" : "Cambiar foto de perfil"}
                  disabled={photoUploading || saving}
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
            <h1>{`${profile.nombre || ""} ${profile.apellido || ""}`.trim() || profile.usuario || "Completá tu perfil"}</h1>
            {profile.usuario && <p className="perfil__role">Usuario: {profile.usuario}</p>}
            <p className="perfil__role">{profile.rol || "Usuario"}</p>
            <p className="perfil__email">
              <img src={envelopeIcon} alt="" />
              {profile.correo || "Correo pendiente"}
            </p>
            {photoUploading && (
              <p className="perfil__photo-feedback" role="status">
                Subiendo foto...
              </p>
            )}
          </section>

          <section className="perfil__password-hint" aria-labelledby="password-hint-title">
            <img src={infoToastIcon} alt="" />
            <div>
              <h2 id="password-hint-title">Tu contraseña debe incluir</h2>
              <ul>
                <li>Al menos 8 caracteres</li>
                <li>Una letra mayúscula</li>
                <li>Una letra minúscula</li>
                <li>Un número</li>
              </ul>
            </div>
          </section>
        </aside>

        <form id="perfil-form" className="perfil__content" onSubmit={enviarFormulario}>
          <header className="perfil__content-header">
            <h2>Mi perfil</h2>
            <p>Administra tu información personal, seguridad y preferencias de cuenta</p>
          </header>

          <section className="perfil__form-section" aria-labelledby="personal-information-title">
            <div className="perfil__section-heading">
              <span className="perfil__section-icon">
                <img src={userIcon} alt="" />
              </span>
              <div>
                <h3 id="personal-information-title">Información personal</h3>
                <p>
                  Mantén tu información actualizada. Estos datos se utilizan en la plataforma y en
                  las comunicaciones del sistema
                </p>
              </div>
            </div>
            <div className="perfil__fields perfil__fields--personal">
              {personalFields.map((field) => (
                <Campo
                  key={field.id}
                  field={field}
                  placeholder={profile[field.id] ? profile[field.id] : field.label}
                />
              ))}
              <CampoSoloLectura field={{ id: "dni", label: "DNI", icon: addressCardIcon }} value={profile.dni} />
            </div>
          </section>

          <section
            className="perfil__form-section perfil__form-section--security"
            aria-labelledby="security-title"
          >
            <div className="perfil__section-heading">
              <span className="perfil__section-icon">
                <img src={lockIcon} alt="" />
              </span>
              <div>
                <h3 id="security-title">Seguridad</h3>
                <p>{cuentaGoogleSinContrasena
                  ? "Creá una contraseña desde esta sesión (dejá vacía la actual). Después vas a poder iniciar sesión con tu usuario y contraseña o con Google."
                  : "Cambia tu contraseña periódicamente para mantener tu cuenta segura"}</p>
              </div>
            </div>
            <div className="perfil__fields perfil__fields--passwords">
              {passwordFields.map((field) => (
                <CampoContrasena
                  key={field.id}
                  field={field}
                  visible={Boolean(visiblePasswords[field.id])}
                  onToggle={togglePassword}
                />
              ))}
            </div>
          </section>
        </form>
      </div>

      <div className="perfil__actions">
        <Boton
          className="perfil__logout-button"
          icon={trashCanIcon}
          text={loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          onClick={cerrarSesion}
          disabled={loggingOut}
        />
        <Boton
          type="submit"
          form="perfil-form"
          className="perfil__save-button"
          icon={checkIcon}
          text={saving ? "Guardando..." : "Guardar cambios"}
          disabled={saving || photoUploading}
        />
      </div>
    </main>
  );
}
