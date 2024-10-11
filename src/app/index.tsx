import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  CameraPosition,
  useCameraDevice,
  useCameraPermission,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";
import { Camera } from "@/components/Camera";
import { Dimensions, Pressable, StyleSheet } from "react-native";
import { P, match } from "ts-pattern";
import { useEffect, useRef, useState } from "react";
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
import { ControlCenter } from "@/components/ControlCenter";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import { useSwipeUpGesture } from "@/hooks/useSwipeUpGesture";
import {
  useDerivedValue,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { paint } from "@/assets/shaders";

const SHAPE_WIDTH = SCREEN_WIDTH * 0.9;
const SHAPE_HEIGHT = (4 / 2.5) * SHAPE_WIDTH;

export default function Homescreen() {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { bottom } = useSafeAreaInsets();

  const controllCenterRef = useRef<BottomSheet>(null);

  const [camera, setCamera] = useState<CameraPosition>("back");
  const device = useCameraDevice(camera);
  const { hasPermission, requestPermission } = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, []);

  const { gesture: zoomGesture, zoom } = useZoomGesture();
  const doubleTapGesture = useDoubleTapGesture(() => {
    setCamera((camera) => (camera === "back" ? "front" : "back"));
  });
  const swipeUpGesture = useSwipeUpGesture(() => {
    controllCenterRef.current?.expand();
  });
  const gestures = Gesture.Race(swipeUpGesture, zoomGesture, doubleTapGesture);

  const opacity = useSharedValue(1);
  const rShapeWidth = useSharedValue(SHAPE_WIDTH);
  const rShapeHeight = useSharedValue(SHAPE_HEIGHT);
  const ovalRect = useDerivedValue(() =>
    rrect(
      rect(
        (SCREEN_WIDTH - rShapeWidth.value) / 2,
        (SCREEN_HEIGHT - rShapeHeight.value) / 2,
        rShapeWidth.value,
        rShapeHeight.value,
      ),
      (SCREEN_HEIGHT - rShapeHeight.value) / 2 + 8,
      rShapeWidth.value,
    ),
  );

  const frameProcessor = useSkiaFrameProcessor((frame) => {
    "worklet";
    frame.render(paint);
  }, []);

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
            <Camera
              device={device}
              zoom={zoom}
              frameProcessor={frameProcessor}
            />
          ))
          .exhaustive()}

        <Canvas style={StyleSheet.absoluteFill}>
          <Group
            clip={ovalRect}
            invertClip={true}
            layer={
              <Paint>
                <Blur blur={50} />
              </Paint>
            }
          >
            <Fill color="white" />
          </Group>
        </Canvas>

        <ThemedText
          style={{
            textAlign: "center",
            fontSize: 40,
            lineHeight: 36,
            marginHorizontal: 32,
            color: "black",
            opacity,
          }}
        >
          Turn Moments into Mesmerizing Grainy Gradients
        </ThemedText>

        <Pressable
          style={{
            alignItems: "center",
            width: "80%",
            position: "absolute",
            backgroundColor: "black",
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 50,
            bottom: bottom + 64,
          }}
          onPress={() => {
            const offset = 300;

            rShapeWidth.value = withTiming(
              isFullScreen ? SHAPE_WIDTH : SCREEN_WIDTH + offset,
              { duration: 1000 },
            );
            rShapeHeight.value = withTiming(
              isFullScreen ? SHAPE_HEIGHT : SCREEN_HEIGHT + offset,
              { duration: 1000 },
            );
            opacity.value = withTiming(isFullScreen ? 1 : 0, { duration: 500 });
            setIsFullScreen((isFullScreen) => !isFullScreen);
          }}
        >
          <ThemedText>✨ Start the Experience</ThemedText>
        </Pressable>

        <ControlCenter ref={controllCenterRef} />
      </ThemedView>
    </GestureDetector>
  );
}
