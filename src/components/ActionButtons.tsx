import {
  FadeOut,
  BounceInLeft,
  BounceInRight,
  FadeIn,
  FadeOutLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Back,
  GalleryImport,
  Camera as CameraIcon,
  IconProps,
} from "iconsax-react-native";
import { ThemedView } from "./ThemedView";
import { AnimatedButton } from "./AnimatedButton";
import { ThemedText } from "./ThemedText";

const iconProps: IconProps = {
  size: 24,
  color: "white",
  variant: "TwoTone",
};

type ActionButtonsProps = {
  isSplitted: boolean;
  mainAction: () => void;
  backAction: () => void;
};

export function ActionButtons({
  isSplitted,
  mainAction,
  backAction,
}: ActionButtonsProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <ThemedView
      style={{
        width: "80%",
        flexDirection: "row",
        position: "absolute",
        bottom: bottom + 64,
        backgroundColor: "transparent",
        gap: 12,
      }}
    >
      {isSplitted && (
        <AnimatedButton
          entering={BounceInRight.duration(400)}
          exiting={FadeOutRight.duration(200)}
          style={{
            backgroundColor: "black",
            padding: 16,
            borderRadius: 1000,
          }}
          onPress={backAction}
        >
          <Back {...iconProps} />
        </AnimatedButton>
      )}

      <AnimatedButton
        style={{
          flex: 1,
          backgroundColor: "black",
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 1000,
          alignItems: "center",
        }}
        onPress={mainAction}
      >
        {isSplitted ? (
          <ThemedView entering={FadeIn.delay(100)}>
            <CameraIcon {...iconProps} />
          </ThemedView>
        ) : (
          <ThemedText
            entering={FadeIn}
            exiting={FadeOut}
            style={{ textAlign: "center" }}
          >
            ✨ Start the Experience
          </ThemedText>
        )}
      </AnimatedButton>

      {isSplitted && (
        <AnimatedButton
          entering={BounceInLeft.duration(400)}
          exiting={FadeOutLeft.duration(200)}
          style={{
            backgroundColor: "black",
            padding: 16,
            borderRadius: 1000,
          }}
        >
          <GalleryImport {...iconProps} />
        </AnimatedButton>
      )}
    </ThemedView>
  );
}
