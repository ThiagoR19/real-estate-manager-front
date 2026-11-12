import "./Button.css";

export default function Button({
  text,
  icon,
  children,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button {...props} type={type} onClick={onClick} className={`button ${className}`.trim()}>
      {icon &&
        (typeof icon === "string" ? (
          <img className="button__icon" src={icon} alt="" aria-hidden="true" />
        ) : (
          icon
        ))}
      {children ?? text}
    </button>
  );
}
