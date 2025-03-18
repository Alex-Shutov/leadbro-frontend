import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Jodit } from 'jodit';
import 'jodit/es2021/jodit.css';
import styles from './editor.module.sass';
import Resizer from 'react-image-file-resizer';
import { handleError } from '../../utils/snackbar';

const Editor = forwardRef(
  ({ onChange, initialHTML, name, placeholder }, ref) => {
    const containerRef = useRef(null);
    const editorRef = useRef(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      },
    }));

    const compressImage = (file, editor, maxWidth = 600, quality = 60) => {
      return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        try {
          reader.onload = (e) => {
            img.onload = () => {
              // Get original dimensions
              const originalWidth = img.width;
              const originalHeight = img.height;

              // Only resize if the image is larger than the max dimensions
              if (originalWidth > maxWidth) {
                // Keep aspect ratio
                const aspectRatio = originalWidth / originalHeight;
                const targetHeight = Math.round(maxWidth / aspectRatio);
                Resizer.imageFileResizer(
                  file,
                  maxWidth,
                  targetHeight,
                  'JPEG',
                  quality,
                  0,
                  (uri) => {
                    setTimeout(() => {
                      editor.selection.insertImage(uri);
                    }, 10);
                  },
                  'base64',
                );
              } else {
                Resizer.imageFileResizer(
                  file,
                  originalWidth,
                  originalHeight,
                  'JPEG',
                  quality,
                  0,
                  (uri) => {
                    setTimeout(() => {
                      editor.selection.insertImage(uri);
                    }, 10);
                  },
                  'base64',
                );
              }
            };
            img.src = e.target.result;
          };
        } catch (err) {
          console.error('Image compression error on drop:', err);
          handleError('Ошибка при вставке файла', err);
        } finally {
          reader.readAsDataURL(file);
        }
      });
    };

    useEffect(() => {
      if (containerRef.current && !editorRef.current) {
        const textarea = document.createElement('textarea');
        textarea.value = initialHTML || '';
        textarea.name = name || '';
        containerRef.current.appendChild(textarea);

        editorRef.current = Jodit.make(textarea, {
          uploader: {
            insertImageAsBase64URI: true,
            imagesExtensions: ['jpg', 'png', 'jpeg'],
            url: 'no-url-to-prevent-default-upload',
            process: function (resp) {
              return { files: [], error: 1, message: 'Upload disabled' };
            },
            processFileName: function (name) {
              return name;
            },
          },
          allowResizeY: true,
          resize: true,
          useAceEditor: false,
          removeButtons: ['upload'],
          placeholder: placeholder || 'Start typing...',
          height: 100,
          minHeight: 100,

          showCharsCounter: false,
          showWordsCounter: false,
          showXPathInStatusbar: false,
          language: 'ru',
          i18n: {
            ru: {
              Insert: 'Вставить',
              Cancel: 'Отмена',
              URL: 'URL',
              Text: 'Текст',
            },
          },
          buttons: [
            'bold',
            'italic',
            'underline',
            'strikethrough',
            '|',
            'ul',
            'ol',
            '|',
            'font',
            'brush',
            'paragraph',
            '|',
            'table',
            'link',
            // 'image',
            '|',
            'undo',
            'redo',
          ],

          link: {
            processPastedLink: true,
            noFollowCheckbox: false,
            openInNewTabCheckbox: false,
            modeClassName: null,
          },
          toolbarAdaptive: false,
          dialog: {
            zIndex: 20000,
          },
          disablePlugins: ['mobile'],
          iframe: false,
          events: {
            beforeInit: function (editor) {
              editor.events.on(
                'drop',
                function (e) {
                  if (
                    e.dataTransfer &&
                    e.dataTransfer.files &&
                    e.dataTransfer.files.length
                  ) {
                    const dt = e.dataTransfer;
                    let handled = false;

                    for (let i = 0; i < dt.files.length; i++) {
                      const file = dt.files[i];

                      if (file.type.indexOf('image') === 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        handled = true;
                        compressImage(file, editor);
                      }
                    }

                    if (handled) {
                      return false;
                    }
                  }
                },
                { priority: 1 },
              );
            },
            afterInit: function (editor) {
              editor.editor.addEventListener('click', function (e) {
                const link = e.target.closest('a');
                if (link) {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.selection.select(link);
                }
              });
              const uploadButton = editor.container.querySelector(
                '[data-ref="upload"]',
              );
              if (uploadButton) {
                uploadButton.remove();
              }

              editor.editor.addEventListener('paste', async function (e) {
                debugger;
                const items = (e.clipboardData || e.originalEvent.clipboardData)
                  .items;

                for (let i = 0; i < items.length; i++) {
                  const item = items[i];

                  if (item.type.indexOf('image') === 0) {
                    e.preventDefault(); // Stop default paste behavior
                    const file = item.getAsFile();

                    if (file) {
                      compressImage(file, editor);
                    }
                  }
                }
              });

              editor.editor.addEventListener('dblclick', function (e) {
                const link = e.target.closest('a');
                if (link) {
                  e.preventDefault();
                  e.stopPropagation();

                  // Выбираем ссылку и открываем диалог редактирования
                  window.open(link.href, '_blank');
                }
              });

              const resizeHandle = document.createElement('div');
              resizeHandle.className = 'jodit-custom-resizer';
              resizeHandle.style.cssText = `
    position: absolute;
    bottom: -8px;
    left: 0;
    right: 0;
    height: 16px;
    background-color: rgba(0, 0, 0, 0.1);
    cursor: ns-resize;
    z-index: 10;
    border-radius: 0 0 12px 12px;
  `;

              editor.container.style.position = 'relative';
              editor.container.appendChild(resizeHandle);

              let startY = 0;
              let startHeight = 0;
              let isResizing = false;

              resizeHandle.addEventListener('mousedown', function (e) {
                isResizing = true;
                startY = e.clientY;
                startHeight = editor.container.offsetHeight;
                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', stopResize);
                e.preventDefault();
              });

              function handleResize(e) {
                if (!isResizing) return;
                const newHeight = startHeight + (e.clientY - startY);
                if (newHeight >= 100) {
                  editor.container.style.height = newHeight + 'px';
                  editor.e.fire('resize');
                }
              }

              function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', stopResize);
              }
            },
            change: async function (newValue) {
              debugger;
              if (onChange) {
                // const processedValue = await processHTMLContent(newValue);
                onChange({
                  target: {
                    name: name || '',
                    value: newValue,
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
