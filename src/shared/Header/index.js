import React, { useRef, useState } from 'react';
import cn from 'classnames';
import styles from './Header.module.sass';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../Icon';
import Search from './Search';
import Messages from './Messages';
import Notification from './Notification';
import User from './User';
import Image from '../Image';
import Logo from '../Logo';
import notification from './Notification';
import { navigation } from '../nav';
import useOutsideClick from '../../hooks/useOutsideClick';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';

const Header = ({ onOpen }) => {
  const [visible, setVisible] = useState(false);
  const handleClick = () => {
    onOpen();
    setVisible(false);
  };
  const ref = useRef(null);
  useOutsideClick(ref, () => setVisible(false));

  return (
    <header className={styles.header}>
      <button className={styles.burger} onClick={() => handleClick()}>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>
      <Logo />
      <div style={{ display: 'contents' }} ref={ref}>
        <Search className={cn(styles.search, { [styles.visible]: visible })} />
      </div>
      <button
        className={cn(styles.buttonSearch, { [styles.active]: visible })}
        onClick={() => setVisible(!visible)}
      >
        <Icon name="search" size="24" />
      </button>
      <HeadersList />
      <div className={styles.control} onClick={() => setVisible(false)}>
        {/*<Link className={cn("button", styles.button)} to="">*/}
        {/*  <Icon name="add" size="24" />*/}
        {/*  <span>Create</span>*/}
        {/*</Link>*/}
        {/*<Messages className={styles.messages} />*/}
        {/*<Notification className={styles.notification}/>*/}
        {/*<User className={styles.user} />*/}
      </div>
      {/* <div className={styles.btns}>
        <Link className={styles.link} to="/sign-in">
          Sign in
        </Link>
        <Link className={cn("button", styles.button)} to="/sign-up">
          Sign up
        </Link>
      </div> */}
    </header>
  );
};

const HeadersList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeIndex, setActiveIndex] = useState(0);
  const handleClick = (x, index) => {
    setActiveIndex(index);
    x.action();
    navigate(x.url);
  };

  const isActive = (url) => {
    // Check if the current pathname starts with the url and the url is not just '/'
    if (url === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(url);
  };
  return (
    <div className={styles.links}>
      {navigation.map((x, index) => (
        <motion.p
          whileHover={{ scale: 1.0 }}
          className={cn(styles.button, {
            [styles.active]: isActive(x.url),
          })}
          key={index}
          onClick={() => handleClick(x, index)}
        >
          {x.title}
        </motion.p>
      ))}
    </div>
  );
};

export default Header;
