/**
 * source: https://github.com/bluesky-social/social-app/blob/main/src/lib/custom-animations/PressableScale.tsx#L19
 */

import React from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type AnimatedProps,
} from "react-native-reanimated";

const DEFAULT_TARGET_SCALE = 0.96;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedButton({
  targetScale = DEFAULT_TARGET_SCALE,
  children,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: {
  targetScale?: number;
  style?: StyleProp<ViewStyle>;
} & AnimatedProps<PressableProps>) {
  const reducedMotion = useReducedMotion();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPressIn={(e) => {
        "worklet";
        if (onPressIn && typeof onPressIn === "function") {
          runOnJS(onPressIn)(e);
        }
        cancelAnimation(scale);
        scale.value = withTiming(targetScale, { duration: 100 });
      }}
      onPressOut={(e) => {
        "worklet";
        if (onPressOut && typeof onPressIn === "function") {
          runOnJS(onPressOut)(e);
        }
        cancelAnimation(scale);
        scale.value = withTiming(1, { duration: 100 });
      }}
      style={[!reducedMotion && animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
