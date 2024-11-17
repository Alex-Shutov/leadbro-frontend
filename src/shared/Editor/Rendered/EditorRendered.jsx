import React, {useEffect, useRef, useState} from 'react';
import DOMPurify from 'dompurify';
import styles from './EditorRendered.module.scss';
import cn from 'classnames';

const EditorRenderer = ({ content, className, maxHeight }) => {

  const contentRef = useRef(null);
  const [shouldLimit, setShouldLimit] = useState(false);
  useEffect(() => {
    if (contentRef.current && maxHeight) {
      const contentHeight = contentRef.current.scrollHeight;
      setShouldLimit(contentHeight > maxHeight);
    }
  }, [content, maxHeight]);
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
      'b',
      'mark',
    ],
    ALLOWED_ATTR: ['style', 'class'],
  });



  return (
      <div
          className={cn(
              styles.editorContent,
              className,
              { [styles.limitedHeight]: shouldLimit }
          )}
          style={maxHeight && shouldLimit ? { maxHeight: `${maxHeight}px` } : {}}
      >
        <div
            ref={contentRef}
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
        {shouldLimit && maxHeight && <div className={styles.gradient} />}
      </div>
  );
};

export default EditorRenderer;
