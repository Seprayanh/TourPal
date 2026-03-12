import { create } from "zustand";

interface SearchModalStore {
  isOpen: boolean;
  initialStep: number;
  onOpen: (step?: number) => void;
  onClose: () => void;
}

const useSearchModal = create<SearchModalStore>((set) => ({
  isOpen: false,
  initialStep: 0,
  onOpen: (step = 0) => set({ isOpen: true, initialStep: step }),
  onClose: () => set({ isOpen: false, initialStep: 0 }),
}));

export default useSearchModal;