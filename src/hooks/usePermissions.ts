import { useEffect } from "react";
import { useCameraPermission } from "react-native-vision-camera";
import * as MediaLibrary from "expo-media-library";

export function usePermissions() {
  const { hasPermission, requestPermission } = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, []);

  const [libraryPermission, requestLibraryPermission] =
    MediaLibrary.usePermissions();

  return {
    hasCameraPermission: hasPermission,
    requestCameraPermission: requestPermission,

    hasLibraryPermission: libraryPermission?.granted ?? false,
    requestLibraryPermission,
  };
}
