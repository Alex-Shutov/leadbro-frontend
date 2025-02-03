import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import Comment from './Comment';
import {
  formatDateOnlyHours,
  formatDateWithDateAndYear,
  formatDateWithoutHours,
  formatHours,
} from '../../utils/formate.date';
import styles from './CommentList.module.sass';
import { sortByDate } from '../../utils/sort.by';
import { LoadingProvider } from '../../providers/LoadingProvider';
import useAppApi from '../../api';
import cn from 'classnames';
import useUser from '../../hooks/useUser';
import { getPageTypeFromUrl } from '../../utils/window.utils';
import useScrollAfterDelete from '../../hooks/useScrollAfterDelete';
import useGroupByDate from '../../hooks/useGroupByDate';
import Loader from '../../shared/Loader';
import useTasksApi from '../../pages/Tasks/tasks.api';

const CommentsList = ({
  comments = {},
  filterComments,
  filterFiles,
  cls,
  isLoadingUpper,
  onDelete,
}) => {
  const { user } = useUser();
  const { deleteComments, isLoading } = useAppApi();

  const filterFunc = (comment) => {
    if (filterComments && !comment.value?.files?.length) {
      return false;
    }
    return !(filterFiles && !comment.value?.text);
  };
  const { groupedByDate: groupedComments, isLoading: groupedLoading } =
    useGroupByDate(comments, filterFunc);

  const { ref, isDeleting, isRendered } = useScrollAfterDelete(comments);

  const handleDeleteComment = (commentId) => {
    isDeleting.current = true;
    deleteComments(commentId, onDelete);
  };

  const getActions = (data) => [
    {
      label: 'Удалить',
      onClick: () => handleDeleteComment(data.id),
      visible: data.sender.id === user.id,
    },
  ];

  if (!Object.keys(comments).length && !isLoading) {
    return <div className={cn(styles.empty, cls)}>Нет комментариев</div>;
  }

  return (
    <div ref={ref} className={cn(cls, styles.commentList)}>
      <LoadingProvider isLoading={isLoading || groupedLoading}>
        {Object.entries(groupedComments).map(([date, dateComments]) => (
          <div key={date} className={styles.dateGroup}>
            <h3 className={styles.dateHeader}>{date}</h3>
            {dateComments.map((comment) => (
              <div className={styles.container}>
                <Comment
                  filterComments={filterComments}
                  filterFiles={filterFiles}
                  hours={formatDateOnlyHours(comment?.date)}
                  sender={comment.sender}
                  text={comment.value?.text ?? ' '}
                  files={comment.value?.files ?? []}
                  comment={comment}
                  actions={getActions}
                />
              </div>
            ))}
          </div>
        ))}
      </LoadingProvider>
    </div>
  );
};

export default CommentsList;
