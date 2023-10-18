export const useDevice = () => {
  const isMobile = () => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    return /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(userAgent);
  };

  return {
    isMobile,
  };
}