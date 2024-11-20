import React, { useState } from 'react';
import FileElement from '../../../shared/File/Element';
import styles from './Comment.module.sass';
import EditorRenderer from '../../../shared/Editor/Rendered/EditorRendered';
import TableMenu from '../../TableMenu';
import Icon from '../../../shared/Icon';
import useUser from '../../../hooks/useUser';
const Comment = ({
  sender,
  text,
  files,
  hours,
  filterComments,
  filterFiles,
  actions,
  comment,
}) => {
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const { user } = useUser();
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
      <div className={styles.rightSide}>
        <div className={styles.hours}>{hours}</div>
        {user?.id === sender?.id && (
          <div className={styles.more} onClick={() => setTableMenuOpen(true)}>
            <Icon fill={'#6F767E'} name={'more-horizontal'} size={28} />
          </div>
        )}

        {tableMenuOpen && (
          <TableMenu
            actions={actions(comment)}
            isVisible={true}
            onClose={() => setTableMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Comment;
