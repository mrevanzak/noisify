import { View } from "react-native";
import Slider from "@react-native-community/slider";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useMemo, useRef } from "react";
import { useControlCenterStore } from "@/stores/useControlCenterStore";
import { Blur, Colorfilter, Wind2 } from "iconsax-react-native";
import { ThemedText } from "./ThemedText";
import { iconProps } from "@/utils/icon";

type ControlCenterProps = Omit<BottomSheetProps, "children">;

export const ControlCenter = forwardRef<BottomSheet, ControlCenterProps>(
  (props, ref) => {
    const snapPoints = useMemo(() => ["45%"], []);

    const blur = useRef(useControlCenterStore.getState().blur);
    const setBlur = useControlCenterStore((s) => s.setBlur);

    const noiseStrength = useRef(
      useControlCenterStore.getState().noiseStrength,
    );
    const setNoiseStrength = useControlCenterStore((s) => s.setNoiseStrength);

    const saturation = useRef(useControlCenterStore.getState().saturation);
    const setSaturation = useControlCenterStore((s) => s.setSaturation);

    return (
      //TODO: fix modal auto close when use the slider for the very first time
      <BottomSheet
        {...props}
        ref={ref}
        activeOffsetY={[-1, 1]}
        failOffsetX={[-5, 5]}
        enablePanDownToClose
        enableDynamicSizing={false}
        snapPoints={snapPoints}
        index={-1}
        backgroundStyle={{ opacity: 0.2 }}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        <BottomSheetView style={{ padding: 16, gap: 16 }}>
          <View
            style={{
              gap: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <View style={{ gap: 8, flexDirection: "row", width: 100 }}>
                <Blur {...iconProps} />
                <ThemedText style={{ color: "white" }}>Blur</ThemedText>
              </View>

              <Slider
                style={{ flex: 1 }}
                value={blur.current}
                onValueChange={(value) => setBlur(value)}
                minimumValue={30}
                maximumValue={150}
                step={1}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
              />
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <View style={{ gap: 8, flexDirection: "row", width: 100 }}>
                <Wind2 {...iconProps} />
                <ThemedText style={{ color: "white" }}>Noise</ThemedText>
              </View>

              <Slider
                style={{ flex: 1 }}
                value={noiseStrength.current}
                onValueChange={(value) => setNoiseStrength(value)}
                minimumValue={0.1}
                maximumValue={0.5}
                step={0.01}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
              />
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <View style={{ gap: 8, flexDirection: "row", width: 100 }}>
                <Colorfilter {...iconProps} />
                <ThemedText style={{ color: "white" }}>Saturation</ThemedText>
              </View>

              <Slider
                style={{ flex: 1 }}
                value={saturation.current}
                onValueChange={(value) => setSaturation(value)}
                minimumValue={1}
                maximumValue={5}
                step={0.1}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
              />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);
