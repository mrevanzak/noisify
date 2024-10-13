import { paint } from "@/assets/shaders";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import {
  Canvas,
  Fill,
  Group,
  Paragraph,
  Skia,
  TextAlign,
  Circle,
  useFonts,
  Paint,
  Blur,
  useClock,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { useCameraStore } from "@/stores/useCameraStore";
import { useSharedValue } from "react-native-worklets-core";
import { useDerivedValue, withTiming } from "react-native-reanimated";

const FONT_SIZE = 48;
const width = 256;
const r = width * 0.33;

type AnimatedSplashScreenProps = {
  onFinish: () => void;
};

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  const isCameraReady = useCameraStore((state) => state.isReady);

  const font = useFonts({
    Pacifico: [Pacifico_400Regular],
  });

  const paragraph = useMemo(() => {
    if (!font) return null;

    const para = Skia.ParagraphBuilder.Make(
      {
        textAlign: TextAlign.Center,
      },
      font,
    )
      .pushStyle({
        fontSize: FONT_SIZE,
        fontFamilies: ["Pacifico"],
        color: Skia.Color("black"),
      })
      .addText("Noisify")
      .build();
    return para;
  }, []);

  const posA = useSharedValue({
    x: (SCREEN_WIDTH - r) / 2,
    y: (SCREEN_HEIGHT - r) / 2,
  });
  const posB = useSharedValue({
    x: (SCREEN_WIDTH + r) / 2,
    y: (SCREEN_HEIGHT - r) / 2,
  });
  const posC = useSharedValue({
    x: SCREEN_WIDTH / 2,
    y: (SCREEN_HEIGHT + r) / 2,
  });

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="white" />

      <Group
        layer={
          <Paint>
            <Blur blur={30} />
          </Paint>
        }
        blendMode="hue"
      >
        <Circle
          cx={(SCREEN_WIDTH - r) / 2}
          cy={(SCREEN_HEIGHT - r) / 2}
          r={r}
          color="#4169E1"
        />
        <Circle
          cx={(SCREEN_WIDTH + r) / 2}
          cy={(SCREEN_HEIGHT - r) / 2}
          r={r}
          color="#FFD700"
        />
        <Circle
          cx={SCREEN_WIDTH / 2}
          cy={(SCREEN_HEIGHT + r) / 2}
          r={r}
          color="#DC143C"
        />
      </Group>

      <Group layer={paint}>
        <Paragraph
          paragraph={paragraph}
          x={0}
          y={SCREEN_HEIGHT / 2 - FONT_SIZE}
          width={SCREEN_WIDTH}
        />
      </Group>
    </Canvas>
  );
}
