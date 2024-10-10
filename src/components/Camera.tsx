import {
  CameraProps,
  Camera as VisionCamera,
} from "react-native-vision-camera";
import Reanimated, {
  useAnimatedProps,
  SharedValue,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";

Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
const ReanimatedCamera = Reanimated.createAnimatedComponent(VisionCamera);

export function Camera({
  device,
  zoom,
  ...props
}: Omit<CameraProps, "isActive" | "zoom"> & { zoom: SharedValue<number> }) {
  const animatedProps = useAnimatedProps<CameraProps>(
    () => ({ zoom: zoom.value }),
    [zoom],
  );

  return (
    <ReanimatedCamera
      {...props}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      animatedProps={animatedProps}
    />
  );
}
