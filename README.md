<img width="64" src="https://github.com/mrevanzak/noisify/blob/main/src/assets/images/icon.png" align="left" />

**Noisify** is an app to turn your favorite photo into a stunning wallpaper. Just snap a pic with your camera and let our app add a beautiful gradient and some cool noise effects. It’s like magic!

![noisify](https://github.com/user-attachments/assets/b15e8533-289a-4911-b434-0c52ab90d5b9)


## How it works
Noisify uses [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera) to display a Camera preview.

Using the VisionCamera's [Frame Processors](https://react-native-vision-camera.com/docs/guides/frame-processors) API the VisionCamera's [Skia Frame Processors](https://react-native-vision-camera.com/docs/guides/skia-frame-processors) integration, we can draws 2d graphics (in this case blur and noisy filter) directly to Camera Frames in realtime at 60 FPS.

This is the relevant code:

```ts
  const paint = useGrainyBlurShader();
  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";
      frame.render(paint);
    },
    [paint],
  );
```

```ts
export function useGrainyBlurShader() {
  const blur = useControlCenterStore((state) => state.blur);
  const noiseStrength = useControlCenterStore((state) => state.noiseStrength);
  const saturation = useControlCenterStore((state) => state.saturation);

  return useMemo(() => {
    shaderBuilder.setUniform("noiseStrength", [noiseStrength]); // Set the noise strength
    shaderBuilder.setUniform("saturation", [saturation]); // Set the saturation factor

    const blurFilter = Skia.ImageFilter.MakeBlur(
      blur,
      blur,
      TileMode.Mirror,
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
  }, [blur, noiseStrength, saturation]);
}
```

> See [`index.tsx`](https://github.com/mrevanzak/noisify/blob/main/src/app/index.tsx) for the full code.

## 
