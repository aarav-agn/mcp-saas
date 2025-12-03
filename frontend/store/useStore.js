import create from "zustand";

const useStore = create((set) => ({
  activeTenant: null,
  setActiveTenant: (t) => set({ activeTenant: t }),
  lastResult: null,
  setLastResult: (r) => set({ lastResult: r })
}));

export default useStore;
