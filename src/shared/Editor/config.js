import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Header from "@editorjs/header";
import InlineCode from "@editorjs/inline-code";
import Marker from '@editorjs/marker';

export const EDITOR_JS_TOOLS = {
    paragraph: {
        class: Paragraph,
        inlineToolbar: true,
        config:{
        }

    },
    header: {
        class: Header,
        inlineToolbar: true,
        config: {
            levels: [1, 2, 3], // Добавляем уровни заголовков
            defaultLevel: 1,
        },
    },
    list: {
        class: List,
        inlineToolbar: true,
        config: {
            defaultStyle: 'unordered',
        },
    },
    inlineCode: InlineCode,
    marker: Marker,
};