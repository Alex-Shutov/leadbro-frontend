import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './Module.module.sass';
import Icon from '../Icon';
import cn from 'classnames';
import useOutsideClick from '../../hooks/useOutsideClick';
import { motion } from 'framer-motion';
import Button from '../Button ';
import { opacityTransition } from '../../utils/motion.variants';

const Modal = ({
  size = 'sm',
  handleClose,
  handleSubmit,
  children,
  cls,
  closeButton,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const ref = useRef(null);
  const innerRef = useRef(null);
  const isFirstRender = useRef(true);

  const handleCloseModal = useCallback(() => {
    setIsVisible(false);
    handleClose && handleClose();
    document.body.style.overflow = 'auto';
  }, [handleClose]);

  const handleSubmitModal = useCallback(() => {
    setIsVisible(false);
    handleSubmit && handleSubmit();
    document.body.style.overflow = 'auto';
  }, [handleSubmit]);

  // const escFunction = useCallback(
  //     (e) => {
  //         if (e.keyCode === 27) {
  //             handleCloseModal();
  //         }
  //     },
  //     [handleCloseModal]
  // );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      // handleSubmitModal();
    }
  }, [handleSubmitModal, handleSubmit]);

  useLayoutEffect(() => {
    const modalNode = ref.current;
    if (modalNode) {
      document.body.appendChild(modalNode);
      document.addEventListener('keydown', () => null, false);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', () => null, false);
      if (modalNode && modalNode.parentNode) {
        // modalNode.parentNode.removeChild(modalNode);
      }
      document.body.style.overflow = 'auto';
    };
  }, []);

  useOutsideClick(innerRef, handleCloseModal);

  if (!isVisible) {
    return null;
  }

  return createPortal(
    <motion.div
      ref={ref}
      animate={'show'}
      initial={'hidden'}
      exit={'hidden'}
      className={cn(styles.appModal)}
      style={
        size === 'sm'
          ? undefined
          : { maxHeight: '100%', display: 'flex', flexDirection: 'column' }
      }
      variants={opacityTransition}
    >
      <div
        id={'innerModal'}
        ref={innerRef}
        className={cn(
          styles.appModal__inner,
          { [styles.appModal__inner__sm]: size === 'sm' },
          { [styles.appModal__inner__md]: size === 'md' },
          { [styles.appModal__inner__lg]: size === 'lg' },
          { [styles.appModal__inner__xl]: size === 'xl' },
          cls,
        )}
      >
        <div className={styles.appModal__closeIcon} onClick={handleCloseModal}>
          <Icon fill={'#6F767E'} name={'close'} size={20} />
        </div>
        {children}
        <div className={styles.buttons}>
          {handleSubmit && (
            <Button
              isSmall={false}
              onClick={() => handleSubmitModal()}
              classname={styles.button}
              name={'Сохранить'}
              type={'primary'}
            />
          )}
          {handleClose && closeButton && (
            <Button
              isSmall={false}
              onClick={() => handleCloseModal()}
              classname={styles.button}
              name={'Удалить'}
              type={'secondary'}
            />
          )}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
};

export default Modal;
