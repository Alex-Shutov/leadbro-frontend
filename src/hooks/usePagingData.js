import {useState, useEffect, useCallback, useMemo} from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router';
import useQueryParam from "./useQueryParam";

const usePagingData = (store, fetchData, getDataFromStore) => {
  const navigate = useNavigate()
  const location = useLocation()
  const pageFromUrl = useQueryParam('page', 1);
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    {
      setCurrentPage(pageFromUrl);
      fetchData(pageFromUrl);
    }
  }, [pageFromUrl]);

  const metaInfo = store.getMetaInfoTable();

  const handlePageChange = useCallback(
    (page) => {
      if (page !== currentPage) {
        navigate({
          pathname: location.pathname,
          search: `?page=${page}`,
        });
      }
    },
    [navigate, location.pathname, currentPage],
  );

  return {
    currentPage,
    totalPages: metaInfo?.last_page || 1,
    totalItems: metaInfo?.total || 0,
    paginatedData: getDataFromStore(),
    itemsPerPage: metaInfo?.per_page || 15,
    handlePageChange,
  };
};

export default usePagingData;
