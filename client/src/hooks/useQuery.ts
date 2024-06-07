import { useNavigate, useLocation, To, NavigateOptions } from 'react-router-dom';

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

  const getQuery = (queryParam: string) => {
    const query = new URLSearchParams(location.search);
    return query.get(queryParam);
  };

  return {
    navigateWithQuery,
    getQuery
  }
}