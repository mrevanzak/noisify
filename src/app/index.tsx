import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  CameraPosition,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { Camera } from "@/components/Camera";
import { Dimensions, StyleSheet } from "react-native";
import { P, match } from "ts-pattern";
import { useEffect, useState } from "react";
import {
  Blur,
  Canvas,
  Fill,
  Group,
  Paint,
  rect,
  rrect,
} from "@shopify/react-native-skia";
import { useZoomGesture } from "@/hooks/useZoomGesture";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDoubleTapGesture } from "@/hooks/useDoubleTapGesture";

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

const SHAPE_WIDTH = SCREEN_WIDTH * 0.8;
const SHAPE_HEIGHT = (4 / 3) * SHAPE_WIDTH;

export default function Homescreen() {
  const [camera, setCamera] = useState<CameraPosition>("back");
  const device = useCameraDevice(camera);

  const { hasPermission, requestPermission } = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, []);

  const { gesture: zoomGesture, zoom } = useZoomGesture();
  const { gesture: doubleTapGesture } = useDoubleTapGesture(() => {
    setCamera((camera) => (camera === "back" ? "front" : "back"));
  });
  const gestures = Gesture.Race(zoomGesture, doubleTapGesture);

  const ovalRect = rrect(
    rect(
      (SCREEN_WIDTH - SHAPE_WIDTH) / 2,
      (SCREEN_HEIGHT - SHAPE_HEIGHT) / 2,
      SHAPE_WIDTH,
      SHAPE_HEIGHT,
    ),
    (SCREEN_HEIGHT - SHAPE_HEIGHT) / 2 + 8,
    SHAPE_WIDTH,
  );

  return (
    <GestureDetector gesture={gestures}>
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {match([hasPermission, device])
          .with([false, P._], () => (
            <ThemedText>Camera permission is not granted</ThemedText>
          ))
          .with([P._, P.nullish], () => (
            <ThemedText>Camera not available</ThemedText>
          ))
          .with([true, P.not(P.nullish)], ([_, device]) => (
            <Camera device={device} zoom={zoom} />
          ))
          .exhaustive()}

        <Canvas style={StyleSheet.absoluteFill}>
          <Group
            clip={ovalRect}
            invertClip={true}
            layer={
              <Paint>
                <Blur blur={20} />
              </Paint>
            }
          >
            <Fill color="white" />
          </Group>
        </Canvas>
      </ThemedView>
    </GestureDetector>
  );
}
