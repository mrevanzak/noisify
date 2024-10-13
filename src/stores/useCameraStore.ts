import { create } from "zustand";

type CameraState = {
  isReady: boolean;
};

type CameraAction = {
  setReady: () => void;
};

export const useCameraStore = create<CameraState & CameraAction>((set) => ({
  isReady: false,
  setReady: () => set({ isReady: true }),
}));
