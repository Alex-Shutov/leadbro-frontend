import React, { useRef, useEffect, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import { EDITOR_JS_TOOLS } from './config';
import './editor.sass';

const EditorComponent = ({ onChange, initialHTML, name, placeholder }) => {
    const ejInstance = useRef(null);
    const isInitialized = useRef(false);
    const isUpdatingContent = useRef(false);

    const createEditorId = () => `editorjs-${Math.random().toString(36).substring(2, 15)}`

    const editorId = useRef(createEditorId());


    const htmlToBlocks = (html) => {
        if (!html || html.trim() === '') return [{
            type: 'paragraph',
            data: {
                text: ''
            }
        }];

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

        return blocks.length > 0 ? blocks : [{
            type: 'paragraph',
            data: {
                text: ''
            }
        }];
    };

    const handleContentChange = async (editor) => {
        if (isUpdatingContent.current) return;

        try {
            const content = await editor.save();

            // Convert blocks to HTML for the parent component
            const html = content.blocks
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

            if (onChange) {
                onChange({
                    target: {
                        name: name,
                        value: html,
                    },
                });
            }
        } catch (error) {
            console.error('Error saving editor data:', error);
        }
    };

    const focusEditor = () => {
        if (ejInstance.current) {
            const currentBlockIndex = ejInstance.current.blocks.getCurrentBlockIndex();
            const blockToFocus = currentBlockIndex !== undefined
                ? ejInstance.current.blocks.getBlockByIndex(currentBlockIndex)
                : ejInstance.current.blocks.getBlockByIndex(0);

            if (blockToFocus) {
                setTimeout(() => {
                    blockToFocus.holder.click();
                }, 0);
            }
        }
    };

    const initEditor = () => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        const initialBlocks = htmlToBlocks(initialHTML);

        const editor = new EditorJS({
            holder: editorId.current,
            tools: EDITOR_JS_TOOLS,
            autofocus: true,
            data: {
                time: new Date().getTime(),
                blocks: initialBlocks
            },
            placeholder: placeholder || 'Текст...',
            onChange: () => handleContentChange(editor),
            onReady: () => {
                // Focus the editor after it's ready
                focusEditor();
            }
        });

        ejInstance.current = editor;
    };

    // Update editor content without reinitializing
    const updateEditorContent = async (newHTML) => {
        if (!ejInstance.current || isUpdatingContent.current) return;

        try {
            isUpdatingContent.current = true;
            const newBlocks = htmlToBlocks(newHTML);

            if (!ejInstance.current.save || !ejInstance.current.clear || !ejInstance.current.blocks) {
                return;
            }

            const isEmptyNewContent = newBlocks.length === 1 &&
                newBlocks[0].type === 'paragraph' &&
                (!newBlocks[0].data.text || newBlocks[0].data.text === '');

            if (isEmptyNewContent) {
                try {
                    await ejInstance.current.clear();
                    focusEditor();
                } catch (e) {
                    console.error('Error clearing editor:', e);
                }
            } else {
                try {
                    const currentData = await ejInstance.current.save();
                    const currentBlocks = currentData.blocks;

                    let contentChanged = currentBlocks.length !== newBlocks.length;

                    if (contentChanged) {
                        await ejInstance.current.blocks.clear();
                        newBlocks.forEach(block => {
                            ejInstance.current.blocks.insert(block.type, block.data);
                        });
                        focusEditor();
                    }
                } catch (e) {
                    console.error('Error comparing or updating blocks:', e);
                }
            }
        } catch (e) {
            console.error('General error in updateEditorContent:', e);
        } finally {
            isUpdatingContent.current = false;
        }
    };

    // Initialize editor when component mounts
    useEffect(() => {
        if (ejInstance.current === null && !isInitialized.current) {
            // Используем setTimeout для обеспечения того, что DOM элемент успел создаться
            const timer = setTimeout(() => {
                initEditor();
            }, 0);

            return () => clearTimeout(timer);
        }

        // Cleanup on unmount
        return () => {
            if (ejInstance.current) {
                try {
                    ejInstance.current.destroy();
                } catch (e) {
                    console.error('Error destroying editor:', e);
                }
                ejInstance.current = null;
                isInitialized.current = false;
            }
        };
    }, []);

    // Update content when initialHTML changes, but try to keep focus
    useEffect(() => {
        // Обновляем контент только если редактор инициализирован
        // и если initialHTML пустой или отличается от текущего содержимого
        if (ejInstance.current && isInitialized.current) {
            // Добавляем задержку для обеспечения полной инициализации API редактора
            const timer = setTimeout(() => {
                // Проверяем, что редактор все еще существует (не размонтирован)
                if (ejInstance.current) {
                    updateEditorContent(initialHTML);
                }
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [initialHTML]);

    return <div id={editorId.current} className="editorjs-wrapper"></div>;
};

export default EditorComponent;