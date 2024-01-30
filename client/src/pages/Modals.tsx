import WithdrawModal from '@components/Account/WithdrawModal';
import DepositModal from '@components/Account/DepositModal';
import { MODALS } from '@helpers/types';
import useModal from '@hooks/useModal';


export default function Modals() {
  const { currentModal } = useModal();

  return (
    <>
      {currentModal === MODALS.WITHDRAW && (
        <WithdrawModal />
      )}

      {currentModal === MODALS.DEPOSIT && (
        <DepositModal />
      )}
    </>
  );
};
