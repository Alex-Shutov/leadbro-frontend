import React, { useRef, useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Dropdown.module.sass";
import Tooltip from "../../Tooltip";
import useOutsideClick from "../../../hooks/useOutsideClick";
import Chevron from "./Chevron";

const Dropdown = ({
                      className,
                      classNameContainer,
                      classDropdownHead,
                      classDropdownLabel,
                      value,
                      setValue,
                      options,
                      label,
                      tooltip,
                      small,
                      upBody,
                      renderOption,
                      noMinWidth,
    placeholder,
                      renderValue,
                  }) => {
    const [visible, setVisible] = useState(false);

    const handleClick = (value) => {
        setValue(value);
        setVisible(false);
    };

    const ref = useRef(null);
    useOutsideClick(ref, () => setVisible(false));

    return (
        <div ref={ref} className={
            cn(
                classNameContainer,
                {[styles.noMinWidth]: noMinWidth},
            )
        }>
            {label && (
                <div className={cn(styles.label, classDropdownLabel)}>
                    {label}{" "}
                    {tooltip && (
                        <Tooltip
                            className={styles.tooltip}
                            title={tooltip}
                            icon="info"
                            place="right"
                        />
                    )}
                </div>
            )}
            <div
                className={cn(
                    styles.dropdown,
                    className,
                    { [styles.small]: small },
                    { [styles.active]: visible }
                )}
            >
                <div
                    className={cn(styles.head, classDropdownHead,{[styles.head_placeholder]:!value})}
                    onClick={() => setVisible(!visible)}
                >
                    <div className={cn(styles.selection,{[styles.selection_placeholder]: !value})}>
                        {value ? renderValue ? renderValue(value) : value : (placeholder ?? label ?? '')}
                    </div>
                    <Chevron isOpen={visible}/>
                </div>
                <div className={cn(styles.body, { [styles.bodyUp]: upBody })}>
                    {options.map((option, index) => (
                        <div
                            className={cn(styles.option, {
                                [styles.selectioned]: option === value,
                            })}
                            onClick={() => handleClick(option, index)}
                            key={index}
                        >
                            {renderOption ? renderOption(option) : option}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dropdown;
