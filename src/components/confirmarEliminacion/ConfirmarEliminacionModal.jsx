import { GestionModal, AccionesModal } from "../index";

export default function ConfirmarEliminacionModal({ isOpen, onClose, onConfirm, title }) {
  return (
    <GestionModal isOpen={isOpen} onClose={onClose} title={title} variant="confirmation">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <AccionesModal onClose={onClose} submitText="Eliminar" />
      </form>
    </GestionModal>
  );
}
