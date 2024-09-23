import React, { useMemo, useState } from 'react';
import styles from './CardInput.module.sass';
import cn from 'classnames';
import Icon from '../../Icon';
import TextInput from '../../TextInput';

const CardInput = ({ label, value, actions, type, name, ...props }) => {
  const [isEdited, setIsEdited] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const getInputClass = () => {
    return {
      [styles.input_email]: type === 'email' && !isEdited,
      [styles.input_tel]: type === 'tel',
    };
  };

  return (
    <>
      <TextInput
        haveDots={true}
        name={name}
        value={value}
        type={type}
        edited={isEdited}
        onEdit={() => setIsEdited(!isEdited)}
        onChange={({ target }) => {
          actions.edit(target);
        }}
        seen={isClicked}
        onSee={() => setIsClicked(!isClicked)}
        classNameActions={styles.actions}
        classLabel={
          props.multiple
            ? styles.label_multiple
            : cn(styles.label, props.classNameLabel)
        }
        classWrap={styles.wrap}
        className={
          props?.multiple && props?.labeled
            ? styles.container_labeled
            : styles.container
        }
        classInput={cn(styles.input, getInputClass(), props?.classInput)}
        label={props?.multiple ? (props?.labeled ? label : null) : label}
        actions={actions}
        {...props}
      />
    </>
  );
  // return (
  //     <div
  //     >
  //         {label && (
  //             <div className={cn( styles.label)}>
  //                 {label}{" "}
  //             </div>
  //         )}
  //         <div className={styles.wrap}>
  //             <input className={cn( styles.input)} value={value} {...props} />
  //             {actions.edit && (
  //                 <div className={styles.edit}>
  //                     <Icon name={'edit'} size="24" />{" "}
  //                 </div>
  //             )}
  //             {actions.delete && (
  //                 <button className={styles.delete}>
  //                     <Icon name="delete" size="24" />{" "}
  //                 </button>
  //             )}
  //             {actions.copy && (
  //                 <button className={styles.copy}>
  //                     <Icon name="copy" size="24" />{" "}
  //                 </button>
  //             )}
  //         </div>
  //
  //     </div>
  // );
};

export default CardInput;
