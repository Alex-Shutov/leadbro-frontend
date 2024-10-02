import styles from './Act.module.sass'
import Button from "../../../../../../shared/Button";
import CardField from "../CardField";
import React from "react";
import Icon from "../../../../../../shared/Icon";
import ServiceBadge, {serviceStatuses} from "../Statuses";
import BasisComponent from "../../../../../../shared/Basis";
const Act = ({ act }) => {
    return (
        <div className={styles.act_main}>
            <CardField labelCls={styles.label}  label={'Акт'}>
                    <BasisComponent className={styles.button_container}  basis={275}>
                        <Button type={'secondary'} after={<Icon size={24} name={'download'}/>} classname={styles.button}
                                name={'Акт с печатью'}/>
                    </BasisComponent>
                    <BasisComponent className={styles.button_container} basis={270}>
                        <Button type={'secondary'} after={<Icon size={24} name={'download'}/>} classname={styles.button}
                                name={'Акт без печати'}/>
                    </BasisComponent>
                    <BasisComponent  basis={960} className={styles.statusContainer}>
                        {/*<ServiceBadge statusType={serviceStatuses.act} status={act.scanStatus}/>*/}
                        {/*<ServiceBadge statusType={serviceStatuses.act} status={act.originalStatus}/>*/}
                    </BasisComponent>
            </CardField>
        </div>
    );
};

export default Act;