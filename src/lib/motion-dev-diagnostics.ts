type MotionDevMeta = Record<string, unknown>;

const DEV_FLAG = Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);

function isDev(): boolean {
  return DEV_FLAG;
}

export function logMotionDev(scope: string, event: string, meta?: MotionDevMeta): void {
  if (!isDev()) return;
  if (meta) {
    console.log(`[MotionDev][${scope}] ${event}`, meta);
    return;
  }
  console.log(`[MotionDev][${scope}] ${event}`);
}

export function logTriggerCount(scope: string, event: string, count: number): void {
  if (!isDev()) return;
  console.log(`[MotionDev][${scope}] ${event}`, { scrollTriggerCount: count });
}
