import { useEffect, useId, useRef, useState } from "react";
import { angleDownIcon } from "../../assets/icons";
import "./DropdownSelect.css";

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

export default function DropdownSelect({
  label,
  value,
  options,
  onChange,
  icon,
  placeholder = label,
  className,
  triggerClassName,
  iconClassName,
  valueClassName,
  chevronClassName,
  optionsClassName,
  optionClassName,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listboxId = useId();

  useEffect(() => {
    function closeWhenClickingOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function closeWithEscape(event) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeWhenClickingOutside);
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.removeEventListener("pointerdown", closeWhenClickingOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen]);

  function handleOptionSelect(option) {
    setIsOpen(false);
    onChange(option);
    triggerRef.current?.focus();
  }

  const selectedLabel = value === options[0] ? placeholder : value;

  return (
    <div
      ref={rootRef}
      className={joinClassNames("select-control", className, isOpen && "is-open")}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        className={joinClassNames("select-control__trigger", triggerClassName)}
        type="button"
        aria-label={label}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((current) => !current)}
      >
        {icon && (
          <span className={joinClassNames("select-control__icon", iconClassName)} aria-hidden="true">
            <img src={icon} alt="" />
          </span>
        )}
        <span className={joinClassNames("select-control__value", valueClassName)}>{selectedLabel}</span>
        <img
          className={joinClassNames("select-control__chevron", chevronClassName)}
          src={angleDownIcon}
          alt=""
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          className={joinClassNames("select-control__options", optionsClassName)}
          role="listbox"
          aria-label={label}
        >
          {options.map((option) => (
            <button
              key={option}
              className={joinClassNames(
                "select-control__option",
                optionClassName,
                value === option && "is-selected",
              )}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
