import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './TableMenu.module.sass';
import cn from 'classnames';
import useOutsideClick from '../../hooks/useOutsideClick';

const TableMenu = ({ actions, position, isVisible, onClose }) => {
  const menu = useRef();
  useOutsideClick(menu, onClose);

  const handleClick = (action) => {
    if (!action.disabled) action.onClick();
    onClose();
  };

  return (
    <motion.div
      ref={menu}
      className={styles.contextMenu}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
      transition={{ duration: 0.2 }}
    >
      <ul className={styles.menuList}>
        {actions.map((action, index) => (
          <li
            key={index}
            onClick={() => handleClick(action)}
            className={cn(styles.menuItem, {
              [styles.disabled]: action.disabled,
            })}
          >
            {action.label}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default TableMenu;
