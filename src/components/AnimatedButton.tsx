import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import Animated, {
  AnimatedProps,
  LinearTransition,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedButton(props: AnimatedProps<TouchableOpacityProps>) {
  return <AnimatedPressable layout={LinearTransition} {...props} />;
}
