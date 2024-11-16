import React from 'react';
import FileElement from '../../../shared/File/Element';
import styles from './Comment.module.sass';
import EditorRenderer from '../../../shared/Editor/Rendered/EditorRendered';
const Comment = ({
  sender,
  text,
  files,
  hours,
  filterComments,
  filterFiles,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.sender}>
        <img src={sender?.image} alt={sender?.name} />
      </div>
      <div className={styles.comment}>
        <span>
          {sender?.lastName ?? ''} {sender?.name ?? ''}
        </span>
        {!filterComments && (
          <EditorRenderer className={styles.comment_text} content={text} />
        )}
        {!filterFiles && Boolean(files?.length) && (
          <div className={styles.files}>
            {files?.map((file) => (
              <FileElement key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.hours}>{hours}</div>
    </div>
  );
};

export default Comment;
