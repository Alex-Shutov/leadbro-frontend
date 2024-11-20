import React, { useMemo } from 'react';
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
  // Преобразуем объект комментариев в массив и сортируем по дате
  const sortedComments = useMemo(() => {
    return (
      Object.entries(comments)
        // Преобразуем строковые даты в объекты Date для корректной сортировки
        .map(([id, comment]) => ({
          id,
          ...comment,
          date: new Date(comment.date),
        }))
        // Сортируем по убыванию (новые сверху)
        .sort((a, b) => a.date - b.date)
        // Фильтруем комментарии согласно условиям
        .filter((comment) => {
          if (filterComments && !comment.value?.files?.length) {
            return false;
          }
          if (filterFiles && !comment.value?.text) {
            return false;
          }
          return true;
        })
    );
  }, [comments, filterComments, filterFiles]);

  // Группируем комментарии по дате (без учета времени)
  const groupedComments = useMemo(() => {
    const groups = {};

    sortedComments.forEach((comment) => {
      const dateKey = formatDateWithDateAndYear(comment.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(comment);
    });

    return groups;
  }, [sortedComments]);

  if (!Object.keys(comments).length) {
    return <div className={cn(styles.empty, cls)}>Нет комментариев</div>;
  }

  const handleDeleteComment = (commentId) => {
    deleteComments(commentId, onDelete);
  };

  const getActions = (data) => [
    {
      label: 'Удалить',
      onClick: () => handleDeleteComment(data.id),
      visible: data.sender.id === user.id,
    },
  ];

  return (
    <div className={cn(cls, styles.commentList)}>
      <LoadingProvider isLoading={isLoading || isLoadingUpper}>
        {Object.entries(groupedComments).map(([date, dateComments]) => (
          <div key={date} className={styles.dateGroup}>
            <h3 className={styles.dateHeader}>{date}</h3>
            {dateComments.map((comment) => (
              <div className={styles.container}>
                <Comment
                  filterComments={filterComments}
                  filterFiles={filterFiles}
                  hours={formatDateOnlyHours(comment.date)}
                  sender={comment.sender}
                  text={comment.value.text}
                  files={comment.value.files}
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
