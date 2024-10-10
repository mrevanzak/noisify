import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  CameraPosition,
  useCameraDevice,
  useCameraPermission,
  useSkiaFrameProcessor,
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
  Skia,
  TileMode,
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

const grainyShader = Skia.RuntimeEffect.Make(`
  uniform shader image; // Input image
  uniform float noiseStrength; // Control for noise intensity
  uniform vec2 resolution; // Screen resolution
  uniform float time; // Time for animated noise

  // Random function to generate pseudo-random values
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  /*
    by @arthurstammet
    https://shadertoy.com/view/tdXXRM
  */
  float tvNoise(vec2 p, float ta, float tb) {
    return fract(sin(p.x * ta + p.y * tb) * 5678.0);
  }

  half4 main(vec2 pos) {
    // Get the color of the image at the current position
    vec4 color = image.eval(pos);
    
    // Normalize position to resolution
    vec2 st = pos / resolution;

    // Time-based values for animated noise
    float t = time + 123.0;
    float ta = t * 0.654321;
    float tb = t * (ta * 0.123456);

    // Generate grain/noise value
    vec4 noise = vec4(1. - tvNoise(st, ta, tb));

    // Blend noise with the image color
    vec3 grainyColor = color.rgb + noiseStrength * noise.rgb;

    // Return the final color (with alpha retained)
    return vec4(grainyColor, color.a);
  }
`);

if (!grainyShader) {
  throw new Error("Couldn't compile the shader");
}
const shaderBuilder = Skia.RuntimeShaderBuilder(grainyShader);
shaderBuilder.setUniform("resolution", [SCREEN_WIDTH, SCREEN_HEIGHT]); // Set the resolution to the screen size
shaderBuilder.setUniform("noiseStrength", [0.4]); // Set the noise strength
shaderBuilder.setUniform("time", [100 * Math.random()]); // Set the time for the animated noise
const grainyFilter = Skia.ImageFilter.MakeRuntimeShader(
  shaderBuilder,
  null,
  null,
);

const grainyBlurImageFilter = Skia.ImageFilter.MakeBlur(
  100,
  100,
  TileMode.Repeat,
  grainyFilter,
);
const paint = Skia.Paint();
paint.setImageFilter(grainyBlurImageFilter);

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
