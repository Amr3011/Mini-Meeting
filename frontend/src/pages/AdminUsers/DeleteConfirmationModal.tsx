import React from "react";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import type { DeleteModalProps } from "./types";

export const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
  isOpen,
  user,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Delete User" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{user?.name}</span>? This action
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Delete User
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
