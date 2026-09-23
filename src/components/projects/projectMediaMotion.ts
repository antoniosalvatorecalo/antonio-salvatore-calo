export interface MediaMotionRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface MediaViewportMetrics {
  position: number;
  visibility: number;
  edgeProgress: number;
}

export interface MediaMotionTarget {
  x: number;
  scale: number;
  opacity: number;
}

export interface MediaMotionConfig {
  edgeScale: number;
  edgeTranslate: number;
  edgeOpacity: number;
}

export const MEDIA_MOTION_CONSTANTS = {
  stableVisibleStart: 0.45,
  stableVisibleEnd: 0.72,
  desktop: {
    edgeScale: 0.98,
    edgeTranslate: 16,
    edgeOpacity: 1,
  },
  mobile: {
    edgeScale: 0.99,
    edgeTranslate: 8,
    edgeOpacity: 1,
  },
  smoothingLambda: 16,
  fullMotionVelocity: 3000,
  velocityLambda: 12,
  velocityEpsilon: 2,
  xEpsilon: 0.05,
  scaleEpsilon: 0.0005,
  opacityEpsilon: 0.001,
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
};

export function getMediaViewportMetrics(
  cardRect: MediaMotionRect,
  viewportRect: MediaMotionRect,
): MediaViewportMetrics {
  const cardWidth = Math.max(0, cardRect.right - cardRect.left);
  const viewportWidth = Math.max(0, viewportRect.right - viewportRect.left);

  if (cardWidth === 0 || viewportWidth === 0) {
    return { position: 0, visibility: 1, edgeProgress: 0 };
  }

  const viewportCenter = (viewportRect.left + viewportRect.right) / 2;
  const cardCenter = (cardRect.left + cardRect.right) / 2;
  const intersectionWidth = Math.max(
    0,
    Math.min(cardRect.right, viewportRect.right) - Math.max(cardRect.left, viewportRect.left),
  );
  const visibleReferenceWidth = Math.min(cardWidth, viewportWidth);
  const visibleRatio = clamp(intersectionWidth / visibleReferenceWidth, 0, 1);
  const visibility = smoothstep(
    MEDIA_MOTION_CONSTANTS.stableVisibleStart,
    MEDIA_MOTION_CONSTANTS.stableVisibleEnd,
    visibleRatio,
  );
  const edgeProgress = 1 - visibility;
  const rawPosition = clamp(
    (cardCenter - viewportCenter) / ((viewportWidth + cardWidth) / 2),
    -1,
    1,
  );

  return {
    position: rawPosition,
    visibility,
    edgeProgress,
  };
}

export function getMediaMotionTarget(
  metrics: MediaViewportMetrics,
  config: MediaMotionConfig,
  velocity = 0,
): MediaMotionTarget {
  // The reference deforms the whole row while moving, then restores every
  // image at rest. Cards farther into the scroll direction trail more.
  const direction = Math.sign(velocity);
  const trailingWeight = 0.7 + 0.3 * smoothstep(-0.65, 0.65, metrics.position * direction);
  const strength = smoothstep(80, MEDIA_MOTION_CONSTANTS.fullMotionVelocity, Math.abs(velocity));
  const deformation = strength * trailingWeight;
  return {
    x: direction * deformation * config.edgeTranslate,
    scale: 1 - deformation * (1 - config.edgeScale),
    opacity: 1 - deformation * (1 - config.edgeOpacity),
  };
}

export function getMediaMotionConfig(isMobile: boolean): MediaMotionConfig {
  return isMobile ? MEDIA_MOTION_CONSTANTS.mobile : MEDIA_MOTION_CONSTANTS.desktop;
}

export function getMotionAlpha(deltaTimeMs: number): number {
  const cappedDeltaTime = Math.min(Math.max(deltaTimeMs, 0), 100);
  return 1 - Math.exp(-(MEDIA_MOTION_CONSTANTS.smoothingLambda * cappedDeltaTime) / 1000);
}
