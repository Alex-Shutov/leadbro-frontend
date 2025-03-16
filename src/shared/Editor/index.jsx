import React, { useCallback, useRef, useEffect, useState } from 'react';
import { createReactEditorJS } from 'react-editor-js';
import { EDITOR_JS_TOOLS } from './config';
import './editor.sass';

const ReactEditorJS = createReactEditorJS();

const EditorComponent = ({ onChange, initialHTML, name, placeholder }) => {
    const editorCore = useRef(null);
    const [editorData, setEditorData] = useState(null);
    const isInitialized = useRef(false);
    const isUpdatingContent = useRef(false);

    // Преобразование HTML в блоки для EditorJS
    const htmlToBlocks = (html) => {
        if (!html || html.trim() === '') return {
            time: new Date().getTime(),
            blocks: [{
                type: 'paragraph',
                data: {
                    text: ''
                }
            }]
        };

        const formattedHtml = /<([a-z][a-z0-9]*)\b[^>]*>/i.test(html)
            ? html
            : `<p>${html}</p>`;

        const parser = new DOMParser();
        const doc = parser.parseFromString(formattedHtml, 'text/html');
        const blocks = [];

        doc.body.childNodes.forEach((node) => {
            if (node.nodeName === 'H1') {
                blocks.push({ type: 'header', data: { text: node.innerHTML, level: 1 } });
            } else if (node.nodeName === 'H2') {
                blocks.push({ type: 'header', data: { text: node.innerHTML, level: 2 } });
            } else if (node.nodeName === 'H3') {
                blocks.push({ type: 'header', data: { text: node.innerHTML, level: 3 } });
            } else if (node.nodeName === 'UL') {
                const items = Array.from(node.querySelectorAll('li')).map((li) => li.innerHTML);
                blocks.push({ type: 'list', data: { items, style: 'unordered' } });
            } else if (node.nodeName === 'P') {
                const text = node.innerHTML;
                blocks.push({ type: 'paragraph', data: { text } });
            }
        });

        return {
            time: new Date().getTime(),
            blocks: blocks.length > 0 ? blocks : [{
                type: 'paragraph',
                data: {
                    text: ''
                }
            }]
        };
    };

    // Преобразование блоков EditorJS обратно в HTML
    const blocksToHTML = (blocks) => {
        return blocks
            .map((block) => {
                switch (block.type) {
                    case 'header':
                        return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                    case 'list':
                        return `<ul>${block.data.items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
                    case 'paragraph':
                        return `<p>${block.data.text}</p>`;
                    default:
                        return '';
                }
            })
            .join('');
    };

    // Обработчик изменений в редакторе
    const handleChange = useCallback(async () => {
        if (isUpdatingContent.current || !editorCore.current) return;

        try {
            const outputData = await editorCore.current.save();

            if (onChange && outputData.blocks) {
                const html = blocksToHTML(outputData.blocks);

                onChange({
                    target: {
                        name: name,
                        value: html,
                    },
                });
            }
        } catch (error) {
            console.error('Ошибка сохранения данных редактора:', error);
        }
    }, [onChange, name]);

    // Инициализация редактора
    const handleInitialize = useCallback((instance) => {
        editorCore.current = instance;
        isInitialized.current = true;
    }, []);

    // Обновление контента редактора
    useEffect(() => {
        if (!editorCore.current || !isInitialized.current || isUpdatingContent.current) return;

        const updateEditor = async () => {
            try {
                isUpdatingContent.current = true;

                // Получить текущие данные редактора
                const currentData = await editorCore.current.save();

                // Преобразовать новый HTML в блоки
                const newData = htmlToBlocks(initialHTML);

                // Проверить, изменился ли контент
                const currentHTML = blocksToHTML(currentData.blocks);
                const newHTML = blocksToHTML(newData.blocks);

                if (currentHTML !== newHTML) {
                    // Очистить и отрендерить новые данные
                    await editorCore.current.clear();
                    await editorCore.current.render(newData);
                }
            } catch (error) {
                console.error('Ошибка обновления редактора:', error);
            } finally {
                isUpdatingContent.current = false;
            }
        };

        updateEditor();
    }, [initialHTML]);

    // Установить начальные данные при монтировании
    useEffect(() => {
        setEditorData(htmlToBlocks(initialHTML));
    }, []);

    return (
        <div className="editorjs-wrapper">
            {editorData && (
                <ReactEditorJS
                    onInitialize={handleInitialize}
                    onChange={handleChange}
                    defaultValue={editorData}
                    tools={EDITOR_JS_TOOLS}
                    placeholder={placeholder || 'Текст...'}
                />
            )}
        </div>
    );
};

export default EditorComponent;