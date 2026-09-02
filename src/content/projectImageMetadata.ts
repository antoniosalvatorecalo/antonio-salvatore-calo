export interface ProjectImageDimensions {
  width: number;
  height: number;
}

export const PROJECT_IMAGE_DIMENSIONS: Record<string, ProjectImageDimensions> = {
  '/media/bugonia/Thumbnail.webp': { width: 2960, height: 2000 },
  '/media/bugonia/1.webp': { width: 2960, height: 2000 },
  '/media/bugonia/2.webp': { width: 2960, height: 2000 },
  '/media/bugonia/3.webp': { width: 2960, height: 2000 },
  '/media/bugonia/4.webp': { width: 2960, height: 2000 },
  '/media/bugonia/5.webp': { width: 2960, height: 2000 },
  '/media/newsquest/Thumbnail.webp': { width: 2960, height: 2000 },
  '/media/newsquest/1.webp': { width: 2960, height: 2000 },
  '/media/newsquest/2.webp': { width: 2960, height: 2000 },
  '/media/newsquest/3.webp': { width: 2960, height: 2000 },
  '/media/newsquest/4.webp': { width: 2960, height: 2000 },
  '/media/newsquest/5.webp': { width: 2960, height: 2000 },
};

export const getProjectImageDimensions = (src?: string) => (
  src ? PROJECT_IMAGE_DIMENSIONS[src] : undefined
);
