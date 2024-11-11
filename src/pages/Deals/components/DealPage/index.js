import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import cn from 'classnames';
import styles from './styles.module.sass';
import useDeals from "../../hooks/useDeals";
import useDealsApi from "../../deals.api";
import {LoadingProvider} from "../../../../providers/LoadingProvider";
import Title from "../../../../shared/Title";
import CardDropdown from "../../../../shared/Dropdown/Card";
import Comments from "../../../../components/Comments";
import DealDescription from "./components/DealDescription";
import {opacityTransition, TranslateYTransition} from "../../../../utils/motion.variants";
import DealTasks from "./components/DealTasks";
import DealStatus from "./components/DealStatus";
import DealInfo from "./components/DealInfo";
import {serviceTypeEnumRu} from "../../../Services/services.types";
import DealMembers from "./components/DealMembers";
import {handleSubmit as handleSubmitSnackbar} from "../../../../utils/snackbar";

const DealPage = observer(() => {
    const { id } = useParams();
    const { data: deal, store: deals } = useDeals(+id);
    const api = useDealsApi();
    const [dropDownClicked, setDropDownClicked] = useState(true);

    const handleChange = (name, payload, withId = true) => {
        deals.changeById(deal?.id ?? +id, name, payload, withId);
    };

    const handleReset = (path) => {
        deals.resetDraft(deal.id, path);
    };

    const handleSubmit = async (path, submitText) => {
        try {
            await api.updateDeal(Number(id), {});
            handleSubmitSnackbar(submitText)
            deals.submitDraft();
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            deals.resetDraft(Number(id), path);
        }
    };

    const handleChangeStatus =  (name,value) =>{
            handleChange(name,value)
            handleSubmit(name,'Статус успешно изменен!')

    }

    return (
        <motion.div
            initial={'hidden'}
            animate={'show'}
            variants={opacityTransition}
        >
            <LoadingProvider isLoading={api.isLoading}>
                <Title title={deal?.name} />
                <div className={styles.dropdown}>
                    <CardDropdown
                        onClick={() => setDropDownClicked(!dropDownClicked)}
                        size={16}
                        className={styles.dropdown_inner}
                        text={<b>Информация о сделке</b>}
                    />
                </div>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <DealStatus
                            handleChange={handleChangeStatus}
                            className={cn(styles.card, styles.card_status)}
                            deal={deal}
                        />
                        <DealTasks
                            className={cn(styles.card, styles.card_status)}
                           deal={deal}
                        />
                        <Comments
                            onChange={handleChange}
                            comments={deal?.comments}
                        />
                    </div>
                    <AnimatePresence>
                        {dropDownClicked && (
                            <motion.div
                                animate={'show'}
                                initial={'hidden'}
                                exit={'hidden'}
                                variants={TranslateYTransition}
                                className={cn(styles.col, {
                                    [styles.col_dropdowned]: dropDownClicked,
                                })}
                            >
                                <DealDescription
                                    dealId={deal?.id}
                                    onChange={handleChange}
                                    onReset={handleReset}
                                    onSubmit={handleSubmit}
                                    description={deal?.description}
                                />
                                <DealInfo
                                    price={deal?.price}
                                    serviceType={serviceTypeEnumRu[deal?.serviceType]}
                                    source={deal?.source}
                                />
                                <DealMembers client={deal?.company} creator={deal?.creator} auditor={deal?.auditor} manager={deal?.manager}/>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </LoadingProvider>
        </motion.div>
    );
});

export default DealPage;