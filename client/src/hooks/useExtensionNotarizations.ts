import { useContext } from 'react';

import { ExtensionNotarizationsContext } from '../contexts/common/ExtensionNotarizations';

const useExtensionNotarizations = () => {
  return { ...useContext(ExtensionNotarizationsContext) };
};

export default useExtensionNotarizations;
