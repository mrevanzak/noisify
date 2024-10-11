import {
  CameraProps,
  Camera as VisionCamera,
} from "react-native-vision-camera";
import Reanimated, {
  useAnimatedProps,
  SharedValue,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { forwardRef } from "react";

Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
const ReanimatedCamera = Reanimated.createAnimatedComponent(VisionCamera);

export type CameraRef = VisionCamera;

export const Camera = forwardRef<
  VisionCamera,
  Omit<CameraProps, "zoom"> & { zoom: SharedValue<number> }
>(({ device, zoom, ...props }, ref) => {
  const animatedProps = useAnimatedProps<CameraProps>(
    () => ({ zoom: zoom.value }),
    [zoom],
  );

  return (
    <ReanimatedCamera
      {...props}
      ref={ref}
      style={StyleSheet.absoluteFill}
      device={device}
      animatedProps={animatedProps}
    />
  );
});
