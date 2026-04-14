import { create } from "zustand";

interface RoleModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useRoleModal = create<RoleModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useRoleModal;
