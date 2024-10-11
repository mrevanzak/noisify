import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { Text } from "react-native";

type ControlCenterProps = Omit<BottomSheetProps, "children">;

export const ControlCenter = forwardRef<BottomSheet, ControlCenterProps>(
  (props, ref) => {
    const snapPoints = useMemo(() => ["50%"], []);

    return (
      <BottomSheet
        {...props}
        ref={ref}
        enablePanDownToClose
        snapPoints={snapPoints}
        bottomInset={46}
        index={-1}
        detached={true}
        style={{ marginHorizontal: 16 }}
        backgroundStyle={{ opacity: 0.2 }}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        <BottomSheetView style={{ flex: 1, alignItems: "center" }}>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);
