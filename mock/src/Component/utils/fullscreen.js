export const enterFullscreen = () => {
  const el = document.documentElement;

  if (el.requestFullscreen) el.requestFullscreen();
};