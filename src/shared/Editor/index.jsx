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
    const addCustomImagePlugin = (editor) => {
      // Создаем CSS стили для выделенного изображения и попапа
      const style = document.createElement('style');
      style.textContent = `
        .jodit-selected-image {
          outline: 2px solid #1e88e5;
          position: relative;
        }
        .jodit-image-popup {
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          z-index: 100;
          display: flex;
          gap: 5px;
          width: 140px;
        }
        .jodit-image-popup button {
          border: none;
          background: #f0f0f0;
          padding: 5px;
          border-radius: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        .jodit-image-popup button:hover {
          background: #e0e0e0;
        }
        .jodit-image-popup button svg {
          width: 16px;
          height: 16px;
        }
        
        /* Стили для попапа справа от изображения */
        .jodit-image-popup-right::before {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-right: 8px solid white;
          left: -8px;
          top: 10px;
          filter: drop-shadow(-1px 0 0 #ccc);
        }
        
        /* Стили для попапа слева от изображения */
        .jodit-image-popup-left::before {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-left: 8px solid white;
          right: -8px;
          top: 10px;
          filter: drop-shadow(1px 0 0 #ccc);
        }
        
        /* Стили для попапа над изображением */
        .jodit-image-popup-top::before {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid white;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          filter: drop-shadow(0 1px 0 #ccc);
        }
      `;
      document.head.appendChild(style);

      // Функция для создания SVG иконок
      const createSvgIcon = (path) => {
        return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${path}</svg>`;
      };

      // Иконки для кнопок
      const icons = {
        alignLeft: createSvgIcon(
          '<path d="M3 21h18v-2H3v2zm0-4h12v-2H3v2zm0-4h18v-2H3v2zm0-4h12v-2H3v2zm0-6v2h18V3H3z"/>',
        ),
        alignCenter: createSvgIcon(
          '<path d="M7 21h10v-2H7v2zm-4-4h18v-2H3v2zm4-4h10v-2H7v2zM3 9h18V7H3v2zm4-4h10V3H7v2z"/>',
        ),
        alignRight: createSvgIcon(
          '<path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12v-2H9v2zM3 3v2h18V3H3z"/>',
        ),
        delete: createSvgIcon(
          '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>',
        ),
      };

      // Отслеживаем клик по изображению
      editor.events.on('click', (e) => {
        // Удаляем предыдущие выделения и попапы
        const oldPopups = editor.editor.querySelectorAll('.jodit-image-popup');
        oldPopups.forEach((popup) => {
          popup.remove();
        });

        const selectedImages = editor.editor.querySelectorAll(
          '.jodit-selected-image',
        );
        selectedImages.forEach((img) => {
          img.classList.remove('jodit-selected-image');
        });

        // Если клик был по изображению
        if (e.target.tagName === 'IMG') {
          const img = e.target;

          // Добавляем класс выделения
          img.classList.add('jodit-selected-image');

          // Создаем попап с кнопками
          const popup = document.createElement('div');
          popup.className = 'jodit-image-popup';

          // Кнопка выравнивания по левому краю
          const alignLeftBtn = document.createElement('button');
          alignLeftBtn.innerHTML = icons.alignLeft;
          alignLeftBtn.title = 'Выровнять по левому краю';
          alignLeftBtn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();

            // First ensure the image is not inside a paragraph
            const parentP = img.closest('p');
            if (parentP && parentP.contains(img)) {
              // If image is inside a paragraph, move it before the paragraph
              parentP.parentNode.insertBefore(img, parentP);
            }

            // Apply float styles for left alignment
            img.style.display = 'inline';
            img.style.float = 'left';
            img.style.marginRight = '10px';
            img.style.marginBottom = '10px';
            img.style.marginLeft = '0';
            img.style.marginTop = '5px';
            editor.events.fire(editor.getEditorValue(), 'change');
          };

          // Кнопка выравнивания по центру
          const alignCenterBtn = document.createElement('button');
          alignCenterBtn.innerHTML = icons.alignCenter;
          alignCenterBtn.title = 'Выровнять по центру';
          alignCenterBtn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();

            // Remove float styles
            img.style.float = 'none';
            img.style.display = 'block';
            img.style.marginLeft = 'auto';
            img.style.marginRight = 'auto';
            img.style.marginTop = '10px';
            img.style.marginBottom = '10px';

            editor.events.fire(editor.getEditorValue(), 'change');
          };

          // Кнопка выравнивания по правому краю
          const alignRightBtn = document.createElement('button');
          alignRightBtn.innerHTML = icons.alignRight;
          alignRightBtn.title = 'Выровнять по правому краю';
          alignRightBtn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();

            // First ensure the image is not inside a paragraph
            const parentP = img.closest('p');
            if (parentP && parentP.contains(img)) {
              // If image is inside a paragraph, move it before the paragraph
              parentP.parentNode.insertBefore(img, parentP);
            }

            // Apply float styles for right alignment
            img.style.display = 'inline';
            img.style.float = 'right';
            img.style.marginLeft = '10px';
            img.style.marginBottom = '10px';
            img.style.marginRight = '0';
            img.style.marginTop = '5px';

            editor.events.fire(editor.getEditorValue(), 'change');
          };

          // Кнопка удаления
          const deleteBtn = document.createElement('button');
          deleteBtn.innerHTML = icons.delete;
          deleteBtn.title = 'Удалить изображение';
          deleteBtn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            img.remove();
            popup.remove();
            editor.events.fire(editor.getEditorValue(), 'change');
          };

          // Добавляем кнопки в попап
          popup.appendChild(alignLeftBtn);
          popup.appendChild(alignCenterBtn);
          popup.appendChild(alignRightBtn);
          popup.appendChild(deleteBtn);

          // Добавляем попап в редактор
          editor.editor.appendChild(popup);

          // Позиционируем попап относительно изображения внутри редактора
          const imgRect = img.getBoundingClientRect();
          const editorRect = editor.editor.getBoundingClientRect();

          // Рассчитываем позицию относительно редактора
          const imgRectInEditor = {
            top: imgRect.top - editorRect.top,
            left: imgRect.left - editorRect.left,
            right: imgRect.right - editorRect.left,
            bottom: imgRect.bottom - editorRect.top,
            width: imgRect.width,
            height: imgRect.height,
          };

          // Определяем доступное пространство справа и слева
          const spaceRight = editorRect.width - imgRectInEditor.right;
          const spaceLeft = imgRectInEditor.left;

          // Устанавливаем позицию попапа
          popup.style.position = 'absolute';

          // По умолчанию ставим попап справа от изображения, если есть место
          if (spaceRight >= 150) {
            // Предполагаем, что ширина попапа около 150px
            popup.style.left = imgRectInEditor.right + 5 + 'px';
            popup.style.top = imgRectInEditor.top + 'px';
            popup.classList.add('jodit-image-popup-right');
          }
          // Если нет места справа, ставим слева
          else if (spaceLeft >= 150) {
            popup.style.left = imgRectInEditor.left - 150 - 5 + 'px';
            popup.style.top = imgRectInEditor.top + 'px';
            popup.classList.add('jodit-image-popup-left');
          }
          // Если нет места ни справа, ни слева, ставим поверх изображения
          else {
            popup.style.left =
              imgRectInEditor.left + imgRectInEditor.width / 2 - 75 + 'px';
            popup.style.top = imgRectInEditor.top - 40 + 'px';
            popup.classList.add('jodit-image-popup-top');
          }
        }
      });
    };

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
          minHeight: rest?.height ?? 100,
          maxHeight: rest?.height + 400,
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

          // controls: {
          //   brush: {
          //     tooltip: 'Цвет текста',
          //     isActive: false,
          //     isDisable: false,
          //     list: {
          //       color: 'Цвет текста',
          //       background: 'Цвет фона',
          //       nocolor: 'Без цвета', // Add this option to the list
          //     },
          //     exec: function (editor, current, control, close, button) {
          //       // Check if the nocolor option was selected
          //       if (control === 'nocolor') {
          //         editor.execCommand('removeFormat');
          //         return false;
          //       }
          //
          //       // Let Jodit handle other options normally
          //       return;
          //     },
          //   },
          // },
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
          enableCommandExecution: true,
          disablePlugins: ['mobile'],
          iframe: false,
          events: {
            beforeCommand: function (command) {
              if (command === 'foreColor') {
                // Find and remove any existing color picker dialogs
                const dialogs = document.querySelectorAll(
                  '.jodit-popup, .jodit-dialog',
                );
                dialogs.forEach((dialog) => {
                  if (
                    dialog.innerHTML.includes('jodit-color-picker') &&
                    !dialog.contains(document.activeElement)
                  ) {
                    dialog.remove();
                  }
                });
              }
            },
            beforeInit: function (editor) {
              editor.events.on('keydown', function (event) {
                if (event.ctrlKey && event.key === 'a') {
                  event.preventDefault(); // Prevent default browser select all

                  const range = editor.selection.createRange();
                  range.selectNodeContents(editor.editor);
                  editor.selection.selectRange(range);
                  setSelectionRange(range);

                  return false;
                }
                debugger;
                if (
                  (event.key === 'Delete' || event.key === 'Backspace') &&
                  selectionRange
                ) {
                  const selection = selectionRange;
                  const editorContent = editor.editor.textContent.trim();

                  if (
                    selection &&
                    (selection.toString().length >=
                      editorContent.length * 0.9 || // If 90% or more is selected
                      (editor.selection.isCollapsed() === false &&
                        editorContent.length > 0 &&
                        selection.toString().length > 0))
                  ) {
                    event.preventDefault();

                    editor.value = ' ';

                    return false;
                  }
                }
              });
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
              addCustomImagePlugin(editor);
              // const ulButton =
              //   editor.container.querySelector('[data-ref="ul"]');
              // if (ulButton) {
              //   ulButton.addEventListener('click', () => {
              //     document.execCommand('insertUnorderedList', false, null);
              //   });
              // }
              //
              // const olButton =
              //   editor.container.querySelector('[data-ref="ol"]');
              // if (olButton) {
              //   olButton.addEventListener('click', () => {
              //     document.execCommand('insertOrderedList', false, null);
              //   });
              // }

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
    z-index: 100000;
    border-radius: 0 0 12px 12px;
  `;

              editor.container.style.position = 'relative';
              editor.container.appendChild(resizeHandle);

              const editorStyle = document.createElement('style');
              editorStyle.textContent = `
  .jodit-container .jodit-wysiwyg ul {
    list-style-type: disc !important;
    padding-left: 2em !important;
  }
  .jodit-container .jodit-wysiwyg ol {
    list-style-type: decimal !important;
    padding-left: 2em !important;
  }
  .jodit-container .jodit-wysiwyg li {
    display: list-item !important;
  }
`;
              editor.container.appendChild(editorStyle);

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
