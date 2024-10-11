import { type ViewProps } from "react-native";
import Animated, { AnimatedProps } from "react-native-reanimated";

import { useThemeColor } from "@/hooks/useThemeColor";
import { forwardRef } from "react";
import { AnimatedView } from "react-native-reanimated/lib/typescript/reanimated2/component/View";

export type ThemedViewProps = AnimatedProps<ViewProps> & {
  lightColor?: string;
  darkColor?: string;
};

export const ThemedView = forwardRef<AnimatedView, ThemedViewProps>(
  ({ style, lightColor, darkColor, ...otherProps }, ref) => {
    const backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      "background",
    );

    return (
      <Animated.View
        ref={ref}
        style={[{ backgroundColor }, style]}
        {...otherProps}
      />
    );
  },
);
