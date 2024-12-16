import React from 'react';
import styles from './Link.module.sass';
import { Link } from 'react-router-dom';
import cn from "classnames";

const TableLink = ({ to, name, onClick, cls }) => {
  return (
    <div onClick={onClick} className={cn(styles.link,cls)}>
        {to ? <Link to={to}>{name}</Link> : <a>{name}</a> }
    </div>
  );
};

export default TableLink;
