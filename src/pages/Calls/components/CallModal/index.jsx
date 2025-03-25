// src/Calls/components/CallModal/index.jsx
import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react';
import styles from './CallModal.module.sass';
import useOutsideClick from '../../../../hooks/useOutsideClick';
import Icon from '../../../../shared/Icon';
import CallHistory from '../CallHistory';
import DialPad from '../DialPad';

const CallModal = observer(({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('history');
  const modalRef = useRef(null);

  // useOutsideClick(modalRef, () => {
  //   if (isOpen) onClose();
  // });

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div ref={modalRef} className={styles.modal}>
        {/*<div className={styles.header}>*/}
        {/*<div className={styles.tabs}>*/}
        {/*  <button*/}
        {/*    className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}*/}
        {/*    onClick={() => setActiveTab('history')}*/}
        {/*  >*/}
        {/*    <Icon name="clock" size={16} />*/}
        {/*    <span>История</span>*/}
        {/*  </button>*/}
        {/*  <button*/}
        {/*    className={`${styles.tab} ${activeTab === 'dialpad' ? styles.active : ''}`}*/}
        {/*    onClick={() => setActiveTab('dialpad')}*/}
        {/*  >*/}
        {/*    <Icon name="phone" size={16} />*/}
        {/*    <span>Набор номера</span>*/}
        {/*  </button>*/}
        {/*</div>*/}
        {/*<button className={styles.closeButton} onClick={onClose}>*/}
        {/*  <Icon name="close" size={16} />*/}
        {/*</button>*/}
        {/*</div>*/}

        <div className={styles.content}>
          <CallHistory />
        </div>
        <DialPad onCallInitiated={() => setActiveTab('history')} />
      </div>
    </div>
  );
});

export default CallModal;
