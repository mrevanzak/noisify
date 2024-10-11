import { Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

export function useDoubleTapGesture(handler: () => void) {
  const doubleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => runOnJS(handler)());

  return doubleTapGesture;
}
