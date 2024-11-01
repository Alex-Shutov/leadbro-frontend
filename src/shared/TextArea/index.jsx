import React, { forwardRef, useEffect, useRef, useState } from 'react';
import useAutosizeTextArea from '../../hooks/useAutosizeTextArea';
import { observer } from 'mobx-react';
import TextareaAutosize from 'react-textarea-autosize';

const TextArea = forwardRef((props, ref) => {
  const textAreaRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const {rows,value,hovered} = props
  useEffect(() => {
    setTimeout(() => {
      setRendered(true);
    }, 50);
  }, [value, hovered]);

  // Модифицированный автосайз
  useEffect(() => {
    if (!textAreaRef.current || !rendered ) return;

    const textarea = textAreaRef.current;
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight);

    // Минимальная высота для однострочного текста
    const minHeight = rows === 1 ? '48px' : `${Math.max(48, lineHeight * rows)}px`;
    textarea.style.height = minHeight;

    // Если контент больше минимальной высоты, увеличиваем
    const scrollHeight = textarea.scrollHeight;
    if (scrollHeight > parseInt(minHeight)) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight+12}px`;
    }

    setRendered(false);
  }, [textAreaRef.current, value, rendered, rows]);
  return (
    <textarea
      value={props.value}
      ref={ref ?? textAreaRef}
      rows={props.rows ?? 1}
      {...props}
    />
    //
  );
});

export default TextArea;
