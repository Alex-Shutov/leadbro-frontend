import React from 'react';
import {Link} from "react-router-dom";
import '../../styles/app.sass'
import styles from './button.module.sass'
import cn from "classnames";


const Button = ({name, after, before, onClick, adaptiveIcon,classname,...rest}) => {
    return (
        <>
        {!rest.isSmallButton && <div className={cn(styles.control,classname,{[styles.isNotSmallTable]:!rest.isSmallButton})} >
                {before}
                <Link className={cn("button", styles.button)} to={rest.to}>
                    <span>{name}</span>
                </Link>
                {after}
            </div>}
            {!rest.isSmallButton && adaptiveIcon && <div className={styles.adaptive}>{adaptiveIcon}</div>}
            {rest.isSmallButton && <div onClick={onClick} className={styles.smallButton}>{adaptiveIcon}</div>}
        </>
)
    ;
};

export default Button;