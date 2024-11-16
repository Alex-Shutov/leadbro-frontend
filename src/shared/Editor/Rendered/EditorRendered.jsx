import React from 'react';
import DOMPurify from 'dompurify';
import styles from './EditorRendered.module.scss';
import cn from 'classnames';

const EditorRenderer = ({ content, className, maxHeight }) => {
  if (!content) return null;

  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p',
      'h1',
      'h2',
      'h3',
      'ul',
      'li',
      'span',
      'strong',
      'code',
      'em',
      'br',
      'mark',
    ],
    ALLOWED_ATTR: ['style', 'class'],
  });

  return (
    <div
      className={`${styles.editorContent} ${maxHeight ? styles.limitedHeight : ''} ${className || ''}`}
      style={maxHeight ? { maxHeight: `${maxHeight}px` } : {}}
    >
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      {maxHeight && <div className={styles.gradient} />}
    </div>
  );
};
export default EditorRenderer;
