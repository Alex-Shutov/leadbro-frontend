import { useEffect, useLayoutEffect } from 'react';

const useAutosizeTextArea = (textAreaRef, value, isRendered, setRendered) => {
  debugger
  useEffect(() => {
    debugger
    if (textAreaRef.current && isRendered) {
      textAreaRef.current.style.height = 'auto';
      const scrollHeight = textAreaRef.current.scrollHeight;

      textAreaRef.current.style.height = scrollHeight + 'px';
      setRendered(false);
    }
  }, [textAreaRef.current, value, isRendered]);
};

export default useAutosizeTextArea;
