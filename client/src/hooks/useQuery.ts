import { useMemo } from 'react';
import { useNavigate, useLocation, To, NavigateOptions } from 'react-router-dom';


const PARAM_KEY_MAP = {
  'AMOUNT_USDC': 'amountUsdc',
  'RECIPIENT_ADDRESS': 'recipientAddress',
  'NETWORK': 'network',
  'TO_TOKEN': 'toToken',
  'APP_ID': 'appId',
  'PLATFORM': 'platform',
  'CURRENCY_INDEX': 'currencyIndex'
};

export default function useQuery() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithQuery = (to: To, options: NavigateOptions = {}) => {
    const path = typeof to === 'string' ? to + location.search : {
        ...to,
        pathname: to.pathname + location.search
    };

    navigate(path, options);
  };

  const queryParams = useMemo(() => {
    const params: Record<string, string | null> = {};
    const searchParams = new URLSearchParams(location.search);

    Object.entries(PARAM_KEY_MAP).forEach(([standardizedKey, originalKey]) => {
      params[standardizedKey] = searchParams.get(originalKey) || null;
    });

    return params;
  }, [location.search]);

  return {
    navigateWithQuery,
    queryParams
  }
}