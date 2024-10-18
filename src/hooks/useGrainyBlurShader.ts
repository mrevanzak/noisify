import { Skia, TileMode } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { useControlCenterStore } from "@/stores/useControlCenterStore";
import { shaderBuilder } from "@/assets/shaders";

export function useGrainyBlurShader() {
  const blur = useControlCenterStore((state) => state.blur);
  const noiseStrength = useControlCenterStore((state) => state.noiseStrength);

  return useMemo(() => {
    shaderBuilder.setUniform("noiseStrength", [noiseStrength]); // Set the noise strength

    const blurFilter = Skia.ImageFilter.MakeBlur(
      blur,
      blur,
      TileMode.Repeat,
      null,
    );
    const grainyBlurFilter = Skia.ImageFilter.MakeRuntimeShader(
      shaderBuilder,
      null,
      blurFilter,
    );

    const paint = Skia.Paint();
    paint.setImageFilter(grainyBlurFilter);

    return paint;
  }, [blur, noiseStrength]);
}
