import { memo, useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  addressCardIcon,
  cameraIcon,
  checkIcon,
  envelopeIcon,
  eyeIcon,
  eyeSlashIcon,
  locationDotIcon,
  lockIcon,
  phoneIcon,
  trashCanIcon,
  userIcon,
} from "../../assets/icons";
import "./Profile.css";
import { Button } from "../../components";
import { api } from "../../services/api.js";
import initials from "../../utils/initials.js";
import avatarClass from "../../utils/avatarClass.js";

const personalFields = [
  { id: "nombre", label: "Nombre", icon: userIcon },
  { id: "apellido", label: "Apellido", icon: userIcon },
  { id: "telefono", label: "Teléfono", icon: phoneIcon },
  { id: "correo", label: "Correo", icon: envelopeIcon },
  { id: "direccion", label: "Dirección", icon: locationDotIcon },
  { id: "dni", label: "DNI", icon: addressCardIcon },
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

const Field = memo(function Field({ field, placeholder }) {
  return (
    <label className="profile__field" htmlFor={field.id}>
      <span className="profile__field-label">{field.label}</span>
      <span className="profile__field-control">
        <img className="profile__field-icon" src={field.icon} alt="" />
        <input id={field.id} name={field.id} placeholder={placeholder} required={field.required} />
      </span>
    </label>
  );
});

const PasswordField = memo(function PasswordField({ field, visible, onToggle }) {
  return (
    <label className="profile__field" htmlFor={field.id}>
      <span className="profile__field-label">
        {field.label}
        {field.required && <b aria-hidden="true">*</b>}
      </span>
      <span className="profile__field-control profile__field-control--password">
        <input
          id={field.id}
          name={field.id}
          type={visible ? "text" : "password"}
          placeholder={field.placeholder}
          required={field.required}
        />
        <button
          className="profile__password-toggle"
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

export default function Profile() {
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState({});
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoNotice, setPhotoNotice] = useState("");
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [, navigate] = useLocation();

  const showProfile = useCallback((updated, token) => {
    setProfile(updated);
    setPhotoLoadError(false);
    const session = api.getSession();
    if (session)
      api.saveSession({
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

  async function closeSession() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await api.logout();
      navigate("/login");
    } catch (error) {
      setLogoutError(error.message);
      setLoggingOut(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSaving(true);
    setSaveError("");
    setSaveNotice("");

    const values = Object.fromEntries(new FormData(form));

    const payload = Object.fromEntries(
      personalFields
        .map(({ id }) => [id, String(values[id] ?? "").trim()])
        .filter(([, value]) => value !== ""),
    );

    const contraseñaActual = values["current-password"];
    const contraseñaNueva = values["new-password"];
    const confirmarContraseña = values["confirm-password"];

    try {
      if (Object.keys(payload).length > 0) {
        const result = await api.updateProfile(payload);
        showProfile(result.perfil, result.token);
      }
      if (contraseñaActual || contraseñaNueva || confirmarContraseña) {
        await api.updatePassword({
          actual: contraseñaActual,
          nueva: contraseñaNueva,
          confirmacion: confirmarContraseña,
        });
      }
      if (
        Object.keys(payload).length > 0 ||
        contraseñaActual ||
        contraseñaNueva ||
        confirmarContraseña
      ) {
        form.reset();
        setSaveNotice("Cambios guardados correctamente.");
      }
    } catch (error) {
      setSaveError(error.message || "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setPhotoError("");
    setPhotoNotice("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Elegí una imagen JPEG, PNG o WebP.");
      input.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("La imagen no puede superar los 2 MiB.");
      input.value = "";
      return;
    }

    setPhotoUploading(true);
    try {
      showProfile(await api.updateProfilePhoto(file));
      setPhotoNotice("Foto de perfil actualizada.");
    } catch (error) {
      setPhotoError(error.message || "No se pudo subir la foto de perfil.");
    } finally {
      setPhotoUploading(false);
      input.value = "";
    }
  };

  useEffect(() => {
    let mounted = true;

    async function cargarPerfil() {
      try {
        const loadedProfile = await api.profile();
        if (mounted) showProfile(loadedProfile ?? {});
      } catch (error) {
        console.error(error);
      }
    }

    cargarPerfil();
    return () => {
      mounted = false;
    };
  }, [showProfile]);

  const iniciales = initials(profile.nombre, profile.apellido);
  const profilePhotoUrl =
    profile.urlFotoPerfil && !photoLoadError ? api.assetUrl(profile.urlFotoPerfil) : "";

  return (
    <main id="profile">
      <div className="profile__layout">
        <aside className="profile__sidebar">
          <section className="profile__identity-card" aria-label="Resumen del perfil">
            <div className={`profile__avatar ${avatarClass(profile.nombre, profile.apellido)}`}>
              {profilePhotoUrl ? (
                <img
                  className="profile__avatar-photo"
                  src={profilePhotoUrl}
                  alt={`Foto de perfil de ${profile.nombre ?? ""} ${profile.apellido ?? ""}`.trim()}
                  onError={() => {
                    setPhotoLoadError(true);
                    setPhotoNotice("");
                    setPhotoError("No se pudo cargar la foto de perfil.");
                  }}
                />
              ) : (
                <span>{iniciales}</span>
              )}
              <label className={`profile__avatar-upload${photoUploading ? " is-uploading" : ""}`}>
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
            <h1>
              {profile.nombre} {profile.apellido}
            </h1>
            <p className="profile__role">{profile.rol || "Usuario"}</p>
            <p className="profile__email">
              <img src={envelopeIcon} alt="" />
              {profile.correo}
            </p>
            {photoUploading && (
              <p className="profile__photo-feedback" role="status">
                Subiendo foto...
              </p>
            )}
            {photoError && (
              <p className="profile__photo-feedback profile__photo-feedback--error" role="alert">
                {photoError}
              </p>
            )}
            {photoNotice && (
              <p className="profile__photo-feedback" role="status">
                {photoNotice}
              </p>
            )}
          </section>

          <section className="profile__password-hint" aria-labelledby="password-hint-title">
            <img src={lockIcon} alt="" />
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

        <form id="profile-form" className="profile__content" onSubmit={handleSubmit}>
          <header className="profile__content-header">
            <h2>Mi perfil</h2>
            <p>Administra tu información personal, seguridad y preferencias de cuenta</p>
          </header>

          <section className="profile__form-section" aria-labelledby="personal-information-title">
            <div className="profile__section-heading">
              <span className="profile__section-icon">
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
            <div className="profile__fields profile__fields--personal">
              {personalFields.map((field) => (
                <Field
                  key={field.id}
                  field={field}
                  placeholder={profile[field.id] ? profile[field.id] : field.label}
                />
              ))}
            </div>
          </section>

          <section
            className="profile__form-section profile__form-section--security"
            aria-labelledby="security-title"
          >
            <div className="profile__section-heading">
              <span className="profile__section-icon">
                <img src={lockIcon} alt="" />
              </span>
              <div>
                <h3 id="security-title">Seguridad</h3>
                <p>Cambia tu contraseña periódicamente para mantener tu cuenta segura</p>
              </div>
            </div>
            <div className="profile__fields profile__fields--passwords">
              {passwordFields.map((field) => (
                <PasswordField
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

      <div className="profile__actions">
        <Button
          className="profile__logout-button"
          icon={trashCanIcon}
          text={loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          onClick={closeSession}
          disabled={loggingOut}
        />
        <Button
          type="submit"
          form="profile-form"
          className="profile__save-button"
          icon={checkIcon}
          text={saving ? "Guardando..." : "Guardar cambios"}
          disabled={saving || photoUploading}
        />
        {saveError && (
          <p className="profile__save-feedback profile__save-feedback--error" role="alert">
            {saveError}
          </p>
        )}
        {saveNotice && (
          <p className="profile__save-feedback" role="status">
            {saveNotice}
          </p>
        )}
        {logoutError && (
          <p className="profile__logout-error" role="alert">
            {logoutError}
          </p>
        )}
      </div>
    </main>
  );
}
