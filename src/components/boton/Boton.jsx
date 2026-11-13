import "./Boton.css";

export default function Boton({
  text,
  icon,
  children,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button {...props} type={type} onClick={onClick} className={`boton ${className}`.trim()}>
      {icon &&
        (typeof icon === "string" ? (
          <img className="boton__icon" src={icon} alt="" aria-hidden="true" />
        ) : (
          icon
        ))}
      {children ?? text}
    </button>
  );
}
