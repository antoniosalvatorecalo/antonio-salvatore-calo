import { gsap } from '@/lib/gsap-setup';
import { CustomEase } from 'gsap/CustomEase';
import { TEXT_MOTION } from './TextRevealMotion';

export interface ScenePlanes {
  scene: HTMLElement;
  roll: HTMLElement;
  rotor: HTMLElement;
  indexPlane: HTMLElement;
  projectPlane: HTMLElement | null;
}

export const PROJECT_TRANSITION_DURATION = 1.8;
gsap.registerPlugin(CustomEase);
// One continuous turn: deliberate takeoff, earlier momentum, a longer landing.
// Keep both axes on this same curve so the two pages remain rigidly connected.
export const PROJECT_TRANSITION_EASE = CustomEase.create('project-turn', '0.65,0,0.2,1');

export function updateSceneGeometry({ scene }: ScenePlanes) {
  scene.style.setProperty('--scene-depth', `${scene.clientWidth / 2}px`);
}

export function setHomePlaneState(planes: ScenePlanes) {
  updateSceneGeometry(planes);
  gsap.set(planes.scene, { '--scene-angle': '0deg', '--scene-progress': 0 });
}

export function setProjectPlaneState(planes: ScenePlanes) {
  updateSceneGeometry(planes);
  gsap.set(planes.scene, { '--scene-angle': '-90deg', '--scene-progress': 1 });
}

// One angle drives both nested axes. The two faces never move independently.
// Starting at the current angle also makes interrupted navigation continuous.
function createTimeline(
  planes: ScenePlanes,
  angle: number,
  reducedMotion: boolean,
  onComplete: () => void,
) {
  updateSceneGeometry(planes);
  const current = parseFloat(planes.scene.style.getPropertyValue('--scene-angle')) || 0;
  gsap.set(planes.scene, { '--scene-progress': Math.abs(current) / 90 });
  return gsap.timeline({ onComplete }).to(planes.scene, {
    '--scene-angle': `${angle}deg`,
    '--scene-progress': Math.abs(angle) / 90,
    duration: reducedMotion ? 0 : (PROJECT_TRANSITION_DURATION * Math.abs(angle - current)) / 90,
    ease: PROJECT_TRANSITION_EASE,
  });
}

export const createOpenTimeline = (
  planes: ScenePlanes,
  reducedMotion: boolean,
  onComplete: () => void,
) => createTimeline(planes, -90, reducedMotion, onComplete);

export const createCloseTimeline = (
  planes: ScenePlanes,
  reducedMotion: boolean,
  onComplete: () => void,
  onHomeReveal?: () => void,
) => {
  const timeline = createTimeline(planes, 0, reducedMotion, onComplete);
  if (onHomeReveal && !reducedMotion) {
    timeline.call(onHomeReveal, [], Math.max(0, timeline.duration() - TEXT_MOTION.routeOverlap));
  }
  return timeline;
};
