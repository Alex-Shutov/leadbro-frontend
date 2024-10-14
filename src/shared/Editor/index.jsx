import React, { useRef, useEffect, useCallback } from 'react';
import { createReactEditorJS } from 'react-editor-js';
import { EDITOR_JS_TOOLS } from './config';
import './editor.scss';

const Editor = createReactEditorJS();

const Index = ({ onChange, initialHTML }) => {
  const editorCore = useRef(null);

  const handleInitialize = useCallback((instance) => {
    editorCore.current = instance;
  }, []);

  const htmlToBlocks = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const blocks = [];
    debugger;
    doc.body.childNodes.forEach((node) => {
      if (node.nodeName === 'H1') {
        const text = handleSpanFormatting(node);
        blocks.push({ type: 'header', data: { text, level: 1 } });
      } else if (node.nodeName === 'H2') {
        const text = handleSpanFormatting(node);
        blocks.push({ type: 'header', data: { text, level: 2 } });
      } else if (node.nodeName === 'H3') {
        const text = handleSpanFormatting(node);
        blocks.push({ type: 'header', data: { text, level: 3 } });
      } else if (node.nodeName === 'UL') {
        const items = Array.from(node.querySelectorAll('li')).map((li) =>
          handleSpanFormatting(li),
        );
        blocks.push({ type: 'list', data: { items, style: 'unordered' } });
      } else if (node.nodeName === 'P') {
        const text = handleSpanFormatting(node);
        if (text) {
          blocks.push({ type: 'paragraph', data: { text } });
        }
      }
    });

    return blocks;
  };

  const handleSpanFormatting = (node) => {
    // const htmlContent = node.innerHTML || node.textContent;
    //
    // // Обработка <span>: удаляем <span> и применяем без bold
    // const text = htmlContent.replace(/<span>(.*?)<\/span>/g, '<span style="font-weight: normal;">$1</span>');
    return node.innerHTML || node.textContent;
  };

  const handleEditorChange = async () => {
    if (!editorCore.current) return;

    try {
      const savedData = await editorCore.current.save();
      const html = savedData.blocks
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
        .join('\n');

      onChange({
        target: {
          name: '',
          value: html,
        },
      });
    } catch (error) {
      console.error('Ошибка сохранения данных редактора:', error);
    }
  };

  return (
    <Editor
      onInitialize={handleInitialize}
      tools={EDITOR_JS_TOOLS}
      defaultValue={{
        blocks: htmlToBlocks(initialHTML),
      }}
      onChange={handleEditorChange}
    />
  );
};

export default Index;