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
  blurOnSelect = false,
  showChevron = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState({ side: "below", maxHeight: 240 });
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

    function closeWhenScrolling(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }

    function closeOnResize() {
      setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeWhenClickingOutside);
    document.addEventListener("keydown", closeWithEscape);
    document.addEventListener("scroll", closeWhenScrolling, true);
    window.addEventListener("resize", closeOnResize);

    return () => {
      document.removeEventListener("pointerdown", closeWhenClickingOutside);
      document.removeEventListener("keydown", closeWithEscape);
      document.removeEventListener("scroll", closeWhenScrolling, true);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [isOpen]);

  function handleOptionSelect(option) {
    setIsOpen(false);
    onChange(option);
    if (blurOnSelect) triggerRef.current?.blur();
    else triggerRef.current?.focus();
  }

  const selectedLabel = value === options[0] ? placeholder : value;

  function toggleOptions() {
    if (!isOpen) {
      const trigger = triggerRef.current.getBoundingClientRect();
      const dialog = rootRef.current.closest('[role="dialog"], dialog');
      const bounds = dialog?.getBoundingClientRect();
      const top = Math.max(8, (bounds?.top ?? 0) + 12);
      const bottom = Math.min(window.innerHeight - 8, (bounds?.bottom ?? window.innerHeight) - 12);
      const below = Math.max(0, bottom - trigger.bottom - 8);
      const above = Math.max(0, trigger.top - top - 8);
      const desired = Math.min(options.length * 38 + 14, 240);
      const side = below >= desired || below >= above ? "below" : "above";
      setPlacement({ side, maxHeight: Math.min(240, side === "above" ? above : below) });
    }
    setIsOpen((current) => !current);
  }

  return (
    <div
      ref={rootRef}
      className={joinClassNames("select-control", className, isOpen && "is-open")}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          event.stopPropagation();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      }}
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
        onClick={toggleOptions}
      >
        {icon && (
          <span
            className={joinClassNames("select-control__icon", iconClassName)}
            aria-hidden="true"
          >
            <img src={icon} alt="" />
          </span>
        )}
        <span className={joinClassNames("select-control__value", valueClassName)}>
          {selectedLabel}
        </span>
        {showChevron && (
          <img
            className={joinClassNames("select-control__chevron", chevronClassName)}
            src={angleDownIcon}
            alt=""
            aria-hidden="true"
          />
        )}
      </button>

      {isOpen && (
        <div
          id={listboxId}
          className={joinClassNames("select-control__options", optionsClassName)}
          data-placement={placement.side}
          style={{ maxHeight: placement.maxHeight }}
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
