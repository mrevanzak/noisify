import { BlurView, BlurViewProps } from "expo-blur";
import React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StatusBarBlurBackgroundImpl = ({
  style,
  ...props
}: BlurViewProps): React.ReactElement | null => {
  const { top } = useSafeAreaInsets();

  return (
    <BlurView
      style={[styles.statusBarBackground, style, { height: top }]}
      intensity={25}
      tint="light"
      experimentalBlurMethod="dimezisBlurView"
      {...props}
    />
  );
};

export const StatusBarBlurBackground = React.memo(StatusBarBlurBackgroundImpl);

const styles = StyleSheet.create({
  statusBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
