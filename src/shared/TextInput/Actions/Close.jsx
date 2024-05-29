import React from 'react';
import styles from "../TextInput.module.sass";
import Icon from "../../Icon";

const Close = ({actions,props,label,setClose}) => {
    return (
        <div className={styles.close} onClick={() => {
            setClose && setClose()
            actions.reset()
            props.onEdit()
            props?.onHover()

        }}><Icon size={24} name={'close'}/>
            <p>{label}</p>
        </div>
    );
};

export default Close;