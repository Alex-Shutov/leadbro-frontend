import React, { useState } from 'react';
import styles from './Sidebar.module.sass';
import { Link, NavLink } from 'react-router-dom';
import cn from 'classnames';
import Icon from '../Icon';
import Theme from '../Theme';
import Dropdown from './Dropdown';
import Help from './Help';
import Image from '../Image';
import OutsideClickLayout from '../Layouts/outsideClickLayout';
import { navigation } from '../nav';

const Sidebar = ({ className, onClose, sideVisible, sideSetVisible }) => {
  const [visibleHelp, setVisibleHelp] = useState(false);
  const [visible, setVisible] = [sideVisible, sideSetVisible];

  const handleCLose = () => {
    setVisible(false);
    setVisibleHelp(false);
    onClose();
  };

  return (
    <>
      {/*// <OutsideClickLayout onClick={handleCLose} >*/}
      <div
        className={cn(styles.sidebar, className, { [styles.active]: visible })}
      >
        <button className={styles.close} onClick={handleCLose}>
          <Icon name="close" size="24" />
        </button>
        <div className={styles.menu}>
          {navigation.map((x, index) =>
            x.url ? (
              <NavLink
                className={styles.item}
                activeClassName={styles.active}
                to={x.url}
                key={index}
                exact
                onClick={onClose}
              >
                {x.icon && <Icon name={x.icon} size="24" />}
                {x.title}
              </NavLink>
            ) : (
              <Dropdown
                className={styles.dropdown}
                visibleSidebar={visible}
                setValue={setVisible}
                key={index}
                item={x}
                onClose={onClose}
              />
            ),
          )}
        </div>
        <button className={styles.toggle}>
          <Icon
            onClick={() => setVisible(!visible)}
            name="arrow-right"
            size="24"
          />
          <Icon onClick={handleCLose} name="close" size="24" />
        </button>
        <div className={styles.foot}>
          <button className={styles.link} onClick={() => setVisibleHelp(true)}>
            {/*<Icon name="help" size="24" />*/}
            {/*Help & getting started*/}
            {/*<div className={styles.counter}>8</div>*/}
          </button>
          {/*<Theme className={styles.theme} visibleSidebar={visible} />*/}
        </div>
      </div>
      {/*<Help*/}
      {/*  visible={visibleHelp}*/}
      {/*  setVisible={setVisibleHelp}*/}
      {/*  onClose={onClose}*/}
      {/*/>*/}
      {/*<div*/}
      {/*  className={cn(styles.overlay, { [styles.active]: visible })}*/}
      {/*  onClick={() => setVisible(false)}*/}
      {/*></div>*/}
      {/*// </OutsideClickLayout>*/}
    </>
  );
};

export default Sidebar;
