import { ActionButtons } from "@/components/ActionButtons";
import { AnimatedButton } from "@/components/AnimatedButton";
import { Camera } from "@/components/Camera";
import { ControlCenter } from "@/components/ControlCenter";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useDoubleTapGesture } from "@/hooks/useDoubleTapGesture";
import { useGrainyBlurShader } from "@/hooks/useGrainyBlurShader";
import { usePermissions } from "@/hooks/usePermissions";
import { useSwipeUpGesture } from "@/hooks/useSwipeUpGesture";
import { useZoomGesture } from "@/hooks/useZoomGesture";
import { useCameraStore } from "@/stores/useCameraStore";
import { useImagePickerStore } from "@/stores/useImagePickerStore";
import { toast } from "@baronha/ting";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import type BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import {
  Blur,
  Canvas,
  Fill,
  Group,
  Image,
  Paint,
  rect,
  rrect,
  useImage,
} from "@shopify/react-native-skia";
import * as MediaLibrary from "expo-media-library";
import { useRef, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { AnimatedView } from "react-native-reanimated/lib/typescript/reanimated2/component/View";
import { captureRef } from "react-native-view-shot";
import {
  type CameraPosition,
  useCameraDevice,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";
import { P, match } from "ts-pattern";

const SHAPE_WIDTH = SCREEN_WIDTH * 0.9;
const SHAPE_HEIGHT = (4 / 2.5) * SHAPE_WIDTH;
const OFFSET = 300;

export default function Homescreen() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const selectedImage = useImagePickerStore((s) => s.imageUri);
  const setImage = useImagePickerStore((s) => s.setImageUri);

  const image = useImage(selectedImage);

  const controllCenterRef = useRef<BottomSheet>(null);

  const setCameraReady = useCameraStore((s) => s.setReady);
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

  const paint = useGrainyBlurShader();
  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";
      frame.render(paint);
    },
    [paint],
  );

  function onStartPress() {
    rShapeWidth.value = match(isFullScreen)
      .with(true, () => withTiming(SHAPE_WIDTH, { duration: 500 }))
      .with(false, () => withTiming(SCREEN_WIDTH + OFFSET, { duration: 1000 }))
      .exhaustive();
    rShapeHeight.value = match(isFullScreen)
      .with(true, () => withTiming(SHAPE_HEIGHT, { duration: 500 }))
      .with(false, () => withTiming(SCREEN_HEIGHT + OFFSET, { duration: 1000 }))
      .exhaustive();
    opacity.value = withTiming(isFullScreen ? 1 : 0, {
      duration: 500,
    });
    setIsFullScreen((isFullScreen) => !isFullScreen);
  }

  async function onShutterPress() {
    if (!hasLibraryPermission) {
      requestLibraryPermission();

      const { granted } = await MediaLibrary.getPermissionsAsync();
      if (!granted) {
        toast({
          preset: "error",
          title: "Need library permission",
          haptic: "error",
        });
        return;
      }
    }

    toast({
      title: "Saving...",
      preset: "spinner",
    });

    try {
      const captured = await captureRef(viewRef);
      await MediaLibrary.saveToLibraryAsync(`file://${captured}`);

      toast({
        title: "Saved to Library",
        haptic: "success",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to save",
        preset: "error",
        haptic: "error",
      });
    }
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
        {match([hasCameraPermission, device])
          .with([false, P._], () => (
            <View style={{ gap: 16 }}>
              <ThemedText
                style={{
                  color: "black",
                }}
              >
                Camera permission is not granted
              </ThemedText>
              <AnimatedButton
                style={{
                  backgroundColor: "black",
                  padding: 16,
                  borderRadius: 1000,
                  alignItems: "center",
                }}
                onPress={() => Linking.openSettings()}
              >
                <ThemedText style={{ color: "white" }}>
                  Grant Permission
                </ThemedText>
              </AnimatedButton>
            </View>
          ))
          .with([P._, P.nullish], () => (
            <ThemedText
              style={{
                color: "black",
              }}
            >
              Camera not available
            </ThemedText>
          ))
          .with([true, P.not(P.nullish)], ([_, device]) => (
            <>
              <View ref={viewRef} style={StyleSheet.absoluteFill}>
                <Camera
                  onInitialized={() => setCameraReady()}
                  device={device}
                  zoom={zoom}
                  frameProcessor={frameProcessor}
                  isActive={!selectedImage}
                />

                <Canvas style={StyleSheet.absoluteFill}>
                  <Group
                    clip={ovalRect}
                    invertClip={true}
                    layer={match(selectedImage)
                      .with(
                        P.string,
                        () => !!image,
                        () => (
                          <Image
                            image={image}
                            x={-(OFFSET / 2)}
                            y={-(OFFSET / 2)}
                            width={SCREEN_WIDTH + OFFSET}
                            height={SCREEN_HEIGHT + OFFSET}
                            fit="cover"
                            paint={paint}
                          />
                        ),
                      )
                      .otherwise(() => (
                        <Paint>
                          <Blur blur={50} />
                        </Paint>
                      ))}
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

              <ActionButtons
                isSplitted={isFullScreen}
                mainAction={() => {
                  isFullScreen ? onShutterPress() : onStartPress();
                }}
                backAction={() => {
                  if (selectedImage) {
                    setImage(null);
                  }
                  onStartPress();
                }}
              />
            </>
          ))
          .exhaustive()}

        <ControlCenter ref={controllCenterRef} />
      </ThemedView>
    </GestureDetector>
  );
}
