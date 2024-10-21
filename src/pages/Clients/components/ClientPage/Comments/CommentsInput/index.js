import React, {useState} from 'react';
import FileUpload from "../../../../../../shared/File/Input";
import {loadAvatar} from "../../../../clients.mocks";
import styles from './CommentsInput.module.sass'
import FileElement from "../../../../../../shared/File/Element";
import TextInput from "../../../../../../shared/TextInput";
import Icon from "../../../../../../shared/Icon";
import Tooltip from "../../../../../../shared/Tooltip";

const CommentsInput = ({ onSendMessage,currentUser, commentsLength }) => {
    const [text, setText] = useState('');
    const [files, setFiles] = useState([]);

    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const handleSendMessage = () => {
        if (text.trim() || files.length > 0) {
            const newMessage = {
                id:commentsLength,
                date: new Date(),
                sender: currentUser,
                value: {
                    text,
                    files,
                },
            };
            onSendMessage(newMessage);
            setText('');
            setFiles([]);
        }
    };

    const handleFileUpload = (uploadedFiles) => {
        setFiles([...files, ...uploadedFiles]);
    };

    const handleDeleteFile = (deletedFileId) =>{
        const copy = [...files]
        setFiles(copy?.filter(el=>el.id!==deletedFileId))
    }

    return (
        <div className={styles.container}>
            <div className={styles.input}>
                <div className={styles.input_attach}>
                    <Tooltip title={'Вставить файлы'}>
                        <FileUpload onFileUpload={handleFileUpload}/>
                    </Tooltip>
                </div>
                <div className={styles.input_field}>
                    <TextInput

                        edited={true}
                        type="textarea"
                        value={text}
                        onChange={handleTextChange}
                        placeholder="Сообщение..."
                    />

                </div>
                <div className={styles.input_send}>
                    <Icon className={styles.send} viewBox={'0 0 20 20'} size={20} fillRule={'evenodd'} fill={'#6F767E'}
                          name={'send'} onClick={handleSendMessage}>Send</Icon>

                </div>


            </div>
            <div className={styles.files}>
                {Array.from(files).map(el => (
                    <FileElement onDelete={(id) => handleDeleteFile(id)} key={el.id} file={el}/>))}
            </div>

        </div>
    );
};

export default CommentsInput;