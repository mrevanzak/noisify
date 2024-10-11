import { create } from "zustand";

type ImagePickerState = {
  imageUri: string | null;
};

type ImagePickerAction = {
  setImageUri: (uri: string | null) => void;
};

export const useImagePickerStore = create<ImagePickerState & ImagePickerAction>(
  (set) => ({
    imageUri: null,
    setImageUri: (uri) => set({ imageUri: uri }),
  }),
);
