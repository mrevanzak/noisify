import { Gesture } from "react-native-gesture-handler";
import {
  Extrapolation,
  interpolate,
  useSharedValue,
} from "react-native-reanimated";

export function useZoomGesture(minZoom: number = 1, maxZoom: number = 10) {
  const zoom = useSharedValue(minZoom);
  const zoomOffset = useSharedValue(0);
  const gesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value;
    })
    .onUpdate((event) => {
      const z = zoomOffset.value * event.scale;
      zoom.value = interpolate(
        z,
        [1, 10],
        [minZoom, maxZoom],
        Extrapolation.CLAMP,
      );
    });

  return { zoom, gesture };
}
