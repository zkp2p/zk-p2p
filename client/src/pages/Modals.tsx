import ReceiveModal from '@components/Account/ReceiveModal';
import { MobileLandingPage } from '@components/MobileLandingPage';

import { MODALS } from '@helpers/types';
import useModal from '@hooks/useModal';


export default function Modals() {
  const { currentModal } = useModal();

  return (
    <>
      {currentModal === MODALS.RECEIVE && (
        <ReceiveModal />
      )}

      {currentModal === MODALS.NOT_SUPPORTED_PLATFORM_DEVICE && (
        <MobileLandingPage />
      )}
    </>
  );
};
