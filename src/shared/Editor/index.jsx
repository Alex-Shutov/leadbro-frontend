import React, {useRef, useEffect, useCallback, forwardRef, useMemo} from 'react';
import { createReactEditorJS } from 'react-editor-js';
import { EDITOR_JS_TOOLS } from './config';
import './editor.sass';

const Editor = createReactEditorJS();

const Index = forwardRef(
  ({ onChange, initialHTML, name, placeholder }, ref) => {
    const editorCore = useRef(null);
    initialHTML = /<([a-z][a-z0-9]*)\b[^>]*>/i.test(initialHTML)
      ? initialHTML
      : `<p>${initialHTML}</p>`;
    if (ref) {
      ref.current = editorCore.current;
    }
    const handleInitialize = useCallback((instance) => {
      editorCore.current = instance;
    }, [initialHTML]);

    const htmlToBlocks = (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const blocks = [];

      doc.body.childNodes.forEach((node) => {
          if (node.nodeName === 'H1') {
              const text = handleSpanFormatting(node);
              blocks.push({type: 'header', data: {text, level: 1}});
          } else if (node.nodeName === 'H2') {
              const text = handleSpanFormatting(node);
              blocks.push({type: 'header', data: {text, level: 2}});
          } else if (node.nodeName === 'H3') {
              const text = handleSpanFormatting(node);
              blocks.push({type: 'header', data: {text, level: 3}});
          } else if (node.nodeName === 'UL') {
              const items = Array.from(node.querySelectorAll('li')).map((li) =>
                  handleSpanFormatting(li),
              );
              blocks.push({type: 'list', data: {items, style: 'unordered'}});
          } else if (node.nodeName === 'P') {
              const text = handleSpanFormatting(node);
              if (text) {
                  blocks.push({type: 'paragraph', data: {text}});
              }
          }
            else if (node.nodeName === 'BR')
              blocks.push({ type: 'paragraph', data: {text:''} });

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
          .join('<br/>');

        onChange({
          target: {
            name: name,
            value: html,
          },
        });
      } catch (error) {
        console.error('Ошибка сохранения данных редактора:', error);
      }
    };
    const memo = useMemo(()=>(
        <Editor
            ref={ref ?? null}
            placeholder={placeholder}
            onInitialize={handleInitialize}
            tools={EDITOR_JS_TOOLS}
            defaultValue={{
                blocks: htmlToBlocks(initialHTML),
            }}
            onChange={handleEditorChange}
        />
    ),[initialHTML])
    return (
      <Editor
        ref={ref ?? null}
        placeholder={placeholder}
        onInitialize={handleInitialize}
        tools={EDITOR_JS_TOOLS}
        defaultValue={{
          blocks: htmlToBlocks(initialHTML),
        }}
        onChange={handleEditorChange}
      />
    );
  },
);

export default Index;
