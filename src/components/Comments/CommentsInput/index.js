import React, { useRef, useState } from 'react';
import FileUpload from '../../../shared/File/Input';
import { loadAvatar } from '../../../pages/Clients/clients.mocks';
import styles from './CommentsInput.module.sass';
import FileElement from '../../../shared/File/Element';
import TextInput from '../../../shared/TextInput';
import Icon from '../../../shared/Icon';
import Tooltip from '../../../shared/Tooltip';

const CommentsInput = ({ onSendMessage, currentUser, commentsLength }) => {
  const [text, setText] = useState(' ');
  const [files, setFiles] = useState([]);
  const editorRef = useRef(null);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSendMessage = () => {
    if (text.trim() || files.length > 0) {
      debugger;
      const newMessage = {
        id: commentsLength,
        date: new Date(),
        sender: currentUser,
        value: {
          text: text === '' || text === ' ' ? '⠀' : text,
          files: files.map((file) => ({
            id: file.id,
            name: file.name,
            extension: file.extension,
            blob: file ?? null,
          })),
        },
      };
      onSendMessage(newMessage);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        editorRef.current.clear();
      }
      setTimeout(() => setText(''), 100);
      setFiles([]);
    }
  };

  const handleFileUpload = (uploadedFiles) => {
    const processedFiles = Array.from(uploadedFiles).map((file) => ({
      id: new Date().toISOString(), // Временный ID для UI
      name: file.name.split('.')[0],
      extension: `.${file.name.split('.').pop()}`,
      blob: file, // Сохраняем сам файл для отправки
    }));

    setFiles([...files, ...processedFiles]);
  };

  const handleDeleteFile = (deletedFileId) => {
    setFiles(files.filter((el) => el.id !== deletedFileId));
  };

  return (
    <div className={styles.container}>
      <div className={styles.input}>
        <div className={styles.input_attach}>
          <Tooltip title={'Вставить файлы'}>
            <FileUpload onFileUpload={handleFileUpload} />
          </Tooltip>
        </div>
        <div className={styles.input_field}>
          <TextInput
            ref={editorRef}
            edited={true}
            name={'comment'}
            type="editor"
            className={styles.comment_input}
            value={text === '' ? ' ' : text}
            onChange={handleTextChange}
            placeholder="Сообщение..."
          />
        </div>
        <div className={styles.input_send}>
          <Icon
            className={styles.send}
            viewBox={'0 0 20 20'}
            size={20}
            fillRule={'evenodd'}
            fill={'#6F767E'}
            name={'send'}
            onClick={handleSendMessage}
          >
            Send
          </Icon>
        </div>
      </div>
      <div className={styles.files}>
        {Array.from(files).map((el) => (
          <FileElement
            onDelete={(id) => handleDeleteFile(id)}
            key={el.id}
            file={el}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentsInput;
