import React, { useMemo, useState } from 'react';
import Card from '../../../../../shared/Card';
import CommentsList from '../../../../../components/CommentsList';
import CommentsInput from './CommentsInput';
import useUser from '../../../../../hooks/useUser';
import CommentsFilters from './CommentsFilters';

const ClientComments = ({ comments, onChange }) => {
  const commentsLength = useMemo(
    () => Object.keys(comments ?? {}).length,
    [comments],
  );
  debugger;
  const user = useUser();
  const [isFilterFiles, setFilterFiles] = useState(false);
  const [isFilterComments, setCommentFiles] = useState(false);

  function countComments() {
    return Object.keys(comments ?? {}).length;
  }

  function countFiles() {
    return Object.values(comments ?? {}).reduce((totalFiles, comment) => {
      return (
        totalFiles + (comment.value.files ? comment.value.files.length : 0)
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
        onSendMessage={(val) => onChange(`comments.${commentsLength}`, val)}
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
        filterFiles={isFilterFiles}
        filterComments={isFilterComments}
        comments={comments}
      />
    </Card>
  );
};

export default ClientComments;
