import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  CameraPosition,
  useCameraDevice,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";
import * as MediaLibrary from "expo-media-library";
import { Camera } from "@/components/Camera";
import { Pressable, StyleSheet, View } from "react-native";
import { P, match } from "ts-pattern";
import { useRef, useState } from "react";
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
import Animated, {
  useDerivedValue,
  withTiming,
  useSharedValue,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { paint } from "@/assets/shaders";
import { Feather } from "@expo/vector-icons";
import { usePermissions } from "@/hooks/usePermissions";
import { captureRef } from "react-native-view-shot";
import { toast } from "@baronha/ting";
import { AnimatedView } from "react-native-reanimated/lib/typescript/reanimated2/component/View";

const SHAPE_WIDTH = SCREEN_WIDTH * 0.9;
const SHAPE_HEIGHT = (4 / 2.5) * SHAPE_WIDTH;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Homescreen() {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { bottom } = useSafeAreaInsets();

  const controllCenterRef = useRef<BottomSheet>(null);

  const viewRef = useRef<AnimatedView>(null);
  const [camera, setCamera] = useState<CameraPosition>("back");
  const device = useCameraDevice(camera);

  const {
    hasCameraPermission,
    hasLibraryPermission,
    requestLibraryPermission,
  } = usePermissions();

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

  function onStartPress() {
    const offset = 300;

    rShapeWidth.value = withTiming(
      isFullScreen ? SHAPE_WIDTH : SCREEN_WIDTH + offset,
      { duration: 1000 },
    );
    rShapeHeight.value = withTiming(
      isFullScreen ? SHAPE_HEIGHT : SCREEN_HEIGHT + offset,
      { duration: 1000 },
    );
    opacity.value = withTiming(isFullScreen ? 1 : 0, {
      duration: 500,
    });
    setIsFullScreen((isFullScreen) => !isFullScreen);
  }

  async function onShutterPress() {
    if (!hasLibraryPermission) {
      requestLibraryPermission();

      const { granted } = await MediaLibrary.getPermissionsAsync();
      if (!granted) return;
    }

    toast({
      title: "Saving...",
      backgroundColor: "#000000",
      preset: "spinner",
    });

    const captured = await captureRef(viewRef);

    await MediaLibrary.saveToLibraryAsync(`file://${captured}`);
    toast({
      title: "Saved to Library",
      haptic: "success",
      backgroundColor: "#000000",
    });
  }

  return (
    <GestureDetector gesture={gestures}>
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View ref={viewRef} style={StyleSheet.absoluteFill}>
          {match([hasCameraPermission, device])
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
        </View>

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

        {isFullScreen ? (
          <ThemedView
            style={{
              flexDirection: "row",
              position: "absolute",
              bottom: bottom + 64,
              backgroundColor: "transparent",
              gap: 16,
            }}
          >
            <AnimatedPressable
              layout={LinearTransition}
              style={{
                backgroundColor: "black",
                padding: 16,
                borderRadius: 50,
              }}
              onPress={onStartPress}
            >
              <Feather name="corner-up-left" size={24} color="white" />
            </AnimatedPressable>

            <AnimatedPressable
              style={{
                backgroundColor: "black",
                padding: 16,
                borderRadius: 50,
              }}
              onPress={onShutterPress}
            >
              <ThemedText>📸</ThemedText>
            </AnimatedPressable>
          </ThemedView>
        ) : (
          <AnimatedPressable
            style={{
              width: "80%",
              position: "absolute",
              backgroundColor: "black",
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 50,
              bottom: bottom + 64,
            }}
            onPress={onStartPress}
          >
            <ThemedText style={{ textAlign: "center" }}>
              ✨ Start the Experience
            </ThemedText>
          </AnimatedPressable>
        )}

        <ControlCenter ref={controllCenterRef} />
      </ThemedView>
    </GestureDetector>
  );
}
