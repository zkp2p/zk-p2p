export type MediaSizeKey = keyof typeof MEDIA_SIZE;

export const MEDIA_SIZE = {
  mobile: '425px',
  tablet: '768px',
  laptop: '1024px',
}

export const device = {
  mobile: `(min-width: ${MEDIA_SIZE.mobile})`,
  tablet: `(min-width: ${MEDIA_SIZE.tablet})`,
  laptop: `(min-width: ${MEDIA_SIZE.laptop})`,
};
