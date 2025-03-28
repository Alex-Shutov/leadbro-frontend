import React from 'react';
import { http } from '../../http';
import styles from './File.module.sass';
import Icon from '../../Icon';
import { API_URL } from '../../constants';
const FileElement = ({ key, file, onDelete }) => {
  const handleDownload = () => {
    window.open(`${API_URL}${file.url}`, '_blank');
    // http.get(`/download/file`).then((response)=>{
    //     return response.data
    // }).then(blob=>{
    //     var url = window.URL.createObjectURL(blob)
    //     var a = document.createElement('a')
    //     a.href = url
    //     a.download = file.fileName
    //     a.click()
    //     a.remove()
    //     setTimeout(() => window.URL.revokeObjectURL(url), 100)
    // })
  };

  return (
    <div onClick={handleDownload} className={styles.file}>
      <div>
        <Icon
          viewBox={'0 0 18 20'}
          fill={'#FF6A55'}
          classname={styles.file_icon}
          name={'file'}
          size={18}
        />
      </div>
      <div className={styles.file_name}>
        <span>{file.name}</span>
      </div>
      {onDelete && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(file.id);
          }}
        >
          <Icon
            fill={'#6F767E'}
            name={'close'}
            size={14}
            viewBox={'0 0 15 15'}
          />
        </div>
      )}
      {/*<button onClick={handleDownload}>Download</button>*/}
    </div>
  );
};

export default FileElement;
