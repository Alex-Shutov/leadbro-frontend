import React, { useMemo, useState } from 'react';
import Card from '../../shared/Card';
import CommentsList from '../CommentsList';
import CommentsInput from './CommentsInput';
import useUser from '../../hooks/useUser';
import CommentsFilters from './CommentsFilters';
import useAppApi from '../../api';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router';

const Comments = ({
  comments,
  onChange,
  prefix = '',
  entityId,
  belongsTo = null,
  onDelete,
}) => {
  const commentsLength = useMemo(
    () => Object.keys(comments ?? {}).length,
    [comments],
  );
  const { id } = useParams();

  const { user } = useUser();
  const [isFilterFiles, setFilterFiles] = useState(false);
  const [isFilterComments, setCommentFiles] = useState(false);
  const url = useLocation();
  const appApi = useAppApi();

  function countComments() {
    return Object.keys(comments ?? {}).length;
  }

  function getCurrentEntityType() {
    const path = url.pathname;
    if (path.includes('clients')) {
      return 'companies';
    } else if (path.includes('deals')) {
      return 'deals';
    } else if (path.includes('tasks') || path.includes('stages')) {
      return 'tasks';
    }
  }

  function countFiles() {
    return Object.values(comments ?? {}).reduce((totalFiles, comment) => {
      return (
        totalFiles + (comment.value?.files ? comment.value.files.length : 0)
      );
    }, 0);
  }

  function handleFilterAll() {
    setFilterFiles(false);
    setCommentFiles(false);
  }
  function handleFilterByComments() {
    setFilterFiles(false);
    setCommentFiles(true);
  }
  function handleFilterByFiles() {
    setFilterFiles(true);
    setCommentFiles(false);
  }
  return (
    <Card>
      <CommentsInput
        commentsLength={commentsLength}
        onSendMessage={async (val) => {
          const result = await appApi.sendComment(
            belongsTo ?? getCurrentEntityType(),
            entityId ?? id,
            { text: val.value.text, files: val.value.files },
          );
          result?.id &&
            onChange(`${prefix}comments.${result.id}`, {
              ...val,
              id: result.id,
            });
        }}
        currentUser={user}
      />
      <CommentsFilters
        filterComments={handleFilterByComments}
        filterFiles={handleFilterByFiles}
        filterAll={handleFilterAll}
        filesLength={countFiles()}
        commentsLength={countComments()}
      />
      <CommentsList
        onDelete={onDelete}
        filterFiles={isFilterFiles}
        filterComments={isFilterComments}
        comments={comments}
      />
    </Card>
  );
};

export default Comments;
