export type ViewportGeometry = { height: number; top: number; keyboardOpen: boolean };

export function viewportGeometry({ height, offsetTop, baselineHeight, inputFocused }: {
  height: number; offsetTop: number; baselineHeight: number; inputFocused: boolean;
}): ViewportGeometry {
  const visibleHeight = Number.isFinite(height) && height > 0 ? height : baselineHeight;
  return {
    height: Math.max(1, visibleHeight),
    // Safari may retain a stale visual offset after the keyboard is dismissed.
    top: inputFocused && Number.isFinite(offsetTop) ? Math.max(0, offsetTop) : 0,
    keyboardOpen: inputFocused && baselineHeight - visibleHeight > 120,
  };
}
