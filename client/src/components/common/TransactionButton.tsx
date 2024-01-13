import React, { useState, useEffect } from "react";

import { Button } from "@components/common/Button";
import { TransactionStatus, TransactionStatusType } from "@helpers/types/transactionStatus";


interface TransactionButtonProps {
  fullWidth?: boolean;
  disabled?: boolean;
  signTransactionStatus?: string;
  mineTransactionStatus?: string;
  defaultLabel?: string;
  minedLabel: string;
  defaultOnClick?: () => void;
  minedOnClick?: () => void;
}

export const TransactionButton: React.FC<TransactionButtonProps> = ({
  fullWidth,
  disabled,
  signTransactionStatus,
  mineTransactionStatus,
  defaultLabel = "Submit Transaction",
  minedLabel,
  defaultOnClick,
  minedOnClick,
}) => {
  /*
   * State
   */

  const [ctaButtonTitle, setCtaButtonTitle] = useState("Submit");

  const [transactionStatus, setSubmitTransactionStatus] = useState<TransactionStatusType>(TransactionStatus.TRANSACTION_CONFIGURED);

  /*
   * Hooks
   */

  useEffect(() => {
    switch (signTransactionStatus) {
      case 'idle':
      case 'error':
        setSubmitTransactionStatus(TransactionStatus.TRANSACTION_CONFIGURED);
        break;

      case 'loading':
        setSubmitTransactionStatus(TransactionStatus.TRANSACTION_LOADING);
        break;

      case 'success':
        // no-op
        break;
    }

  }, [signTransactionStatus]);

  useEffect(() => {
    switch (mineTransactionStatus) {
      case 'idle':
      case 'error':
        setSubmitTransactionStatus(TransactionStatus.TRANSACTION_CONFIGURED);
        break;

      case 'loading':
        setSubmitTransactionStatus(TransactionStatus.TRANSACTION_MINING);
        break;
        
      case 'success':
        setSubmitTransactionStatus(TransactionStatus.TRANSACTION_MINED);
        break;
    }

  }, [mineTransactionStatus]);

  useEffect(() => {
    switch (transactionStatus) {
      case TransactionStatus.TRANSACTION_CONFIGURED:
        setCtaButtonTitle(defaultLabel);
        break;

      case TransactionStatus.TRANSACTION_LOADING:
        setCtaButtonTitle("Signing Transaction");
        break;

      case TransactionStatus.TRANSACTION_MINING:
        setCtaButtonTitle("Mining Transaction");
        break;
        
      case TransactionStatus.TRANSACTION_MINED:
      default:
        setCtaButtonTitle(minedLabel);
        break;
    }
  }, [transactionStatus, defaultLabel, minedLabel]);

  /*
   * Helpers
   */

  const isDisabled = () => {
    const disabledTransactionStatuses = [
      TransactionStatus.TRANSACTION_LOADING,
      TransactionStatus.TRANSACTION_MINING,
    ];

    return disabled || disabledTransactionStatuses.includes(transactionStatus);
  };

  const handleClick = () => {
    if (transactionStatus === TransactionStatus.TRANSACTION_MINED && minedOnClick) {
      minedOnClick();
    } else if (defaultOnClick) {
      defaultOnClick();
    }
  };

  return (
    <Button
      fullWidth={fullWidth}
      disabled={isDisabled()}
      onClick={handleClick}
    >
      {ctaButtonTitle}
    </Button>
  );
};
