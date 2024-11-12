import { useEffect, useLayoutEffect } from 'react';

const useAutosizeTextArea = (textAreaRef, value, isRendered, setRendered) => {
  useEffect(() => {
    if (textAreaRef.current && isRendered) {
      debugger;
      textAreaRef.current.style.height = textAreaRef.current.style.clientHeight;
      const scrollHeight = textAreaRef.current.scrollHeight;

      textAreaRef.current.style.height = scrollHeight + 'px';
      setRendered(false);
    }
  }, [textAreaRef.current, value, isRendered]);
};

export default useAutosizeTextArea;
