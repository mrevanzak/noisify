import { Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

const SWIPE_UP_THRESHOLD = -40;

export function useSwipeUpGesture(onSwipeUp: () => void) {
  const swipeUp = Gesture.Pan().onEnd((event) => {
    if (event.translationY < SWIPE_UP_THRESHOLD) runOnJS(onSwipeUp)();
  });
  return swipeUp;
}
