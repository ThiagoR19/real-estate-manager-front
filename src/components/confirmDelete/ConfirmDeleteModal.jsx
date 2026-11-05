import { ManagementModal, ModalActions } from "../index";

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title }) {
  return (
    <ManagementModal isOpen={isOpen} onClose={onClose} title={title} variant="confirmation">
      <form onSubmit={(event) => { event.preventDefault(); onConfirm(); }}>
        <ModalActions onClose={onClose} submitText="Eliminar" />
      </form>
    </ManagementModal>
  );
}
