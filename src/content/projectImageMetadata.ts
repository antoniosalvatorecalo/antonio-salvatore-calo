export interface ProjectImageDimensions {
  width: number;
  height: number;
}

export const PROJECT_IMAGE_DIMENSIONS: Record<string, ProjectImageDimensions> = {
  '/media/bugonia/File Bugonia Thumbnail.jpg': { width: 2960, height: 2000 },
  '/media/bugonia/Context-Brief.jpg': { width: 2960, height: 2000 },
  '/media/bugonia/The problem-Core solution.jpg': { width: 2960, height: 2000 },
  '/media/bugonia/Bugonia-menu.jpg': { width: 2960, height: 2000 },
  '/media/bugonia/Bugonia-mobile.jpg': { width: 2960, height: 2000 },
  '/media/bugonia/Bugonia-home-desktop-mobile.jpg': { width: 2960, height: 2000 },
  '/media/bugonia/Bugonia-Booking-Tiket.jpg': { width: 2960, height: 2000 },
  '/media/bugonia/Merch_Mobile.jpg': { width: 2960, height: 2000 },
  '/media/bugonia/Merchandaising.png': { width: 2960, height: 2000 },
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
