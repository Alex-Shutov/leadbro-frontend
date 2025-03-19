import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Jodit } from 'jodit';
import 'jodit/es2021/jodit.css';
import styles from './editor.module.sass';
import Resizer from 'react-image-file-resizer';
import { handleError } from '../../utils/snackbar';
import { setSelectionRange } from '@testing-library/user-event/dist/utils';
import addCustomImagePlugin from './plugins/image.plugin';
import { compressImage } from './utils/compressImage';
import addResizePlugin from './plugins/resize.plugin';
import {
  afterInitClick,
  afterInitDblClick,
  afterInitPaste,
  beforeInitDrop,
  beforeInitKeyDown,
} from './events';
import { EditorJsTools } from './config';

const Editor = forwardRef(
  ({ onChange, initialHTML, name, placeholder, ...rest }, ref) => {
    const containerRef = useRef(null);
    const editorRef = useRef(null);
    const [selectionRange, setSelectionRange] = useState(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      },
    }));

    useEffect(() => {
      if (containerRef.current && !editorRef.current) {
        const textarea = document.createElement('textarea');
        textarea.value = initialHTML || '';
        textarea.name = name || '';
        containerRef.current.appendChild(textarea);

        Jodit.defaultOptions.controls.bulletList = {
          name: 'bulletList',
          iconURL: null,
          exec: (editor) => {
            editor.execCommand('insertUnorderedList');
          },
          tooltip: 'Маркированный список',
          list: {
            default: 'Маркированный список',
          },
        };

        Jodit.defaultOptions.controls.numberedList = {
          name: 'numberedList',
          iconURL: null,
          exec: (editor) => {
            editor.execCommand('insertOrderedList');
          },
          tooltip: 'Нумерованный список',
          list: {
            default: 'Нумерованный список',
          },
        };

        editorRef.current = Jodit.make(textarea, {
          ...EditorJsTools,
          placeholder: placeholder || 'Start typing...',
          minHeight: rest?.height ?? 100,
          maxHeight: rest?.height + 400,
          events: {
            beforeInit: function (editor) {
              beforeInitKeyDown(editor, selectionRange, selectionRange);
              beforeInitDrop(editor);
            },
            afterInit: function (editor) {
              addCustomImagePlugin(editor);

              afterInitClick(editor);

              afterInitPaste(editor);

              afterInitDblClick(editor);

              addResizePlugin(editor);
            },
            change: async function (newValue) {
              debugger;
              if (onChange) {
                onChange({
                  target: {
                    name: name || '',
                    value: newValue === '' ? ' ' : newValue,
                  },
                });
              }
            },
          },
          zIndex: 100000,
        });
        textarea.remove();
      }

      return () => {
        if (editorRef.current) {
          editorRef.current.destruct();
          editorRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      if (editorRef.current && initialHTML !== undefined) {
        editorRef.current.value = initialHTML;
      }
    }, [initialHTML]);

    return <div ref={containerRef} className={styles.editorContainer}></div>;
  },
);

export default Editor;
