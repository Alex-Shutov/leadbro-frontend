import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Header from '@editorjs/header';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import BreakLine from 'editorjs-break-line';

export const EditorJsTools = {
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
  enableCommandExecution: true,
  disablePlugins: ['mobile'],
  iframe: false,
};
