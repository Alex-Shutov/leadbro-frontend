import React, {useEffect, useMemo, useRef} from 'react';
import {motion} from "framer-motion";
import {opacityTransition} from "../../utils/motion.variants";
import styles from "./settings.module.sass";
import {useLocation} from "react-router";
import EmployesTable from "./components/EmployesTable";
import LegalsTable from "./components/LegalsTable";

const SettingsPage = () => {
    const location = useLocation()
    console.log(location.search)
    const currentSwitcher = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('filter') || 'employers';
    }, [location.search]);
    return(
        <motion.div
            variants={opacityTransition}
            initial="hidden"
            animate="show" className={styles.container}>

            {currentSwitcher === 'employers' ? <EmployesTable currentSwitcher={currentSwitcher}/> : <LegalsTable currentSwitcher={currentSwitcher}/> }
        {/*<EmployesTable currentSwitcher={currentSwithcer ?? 'employers'}/>*/}
            {/*<LegalsTable/>*/}
        </motion.div>
    );
};

export default SettingsPage;