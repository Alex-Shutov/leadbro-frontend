import React from 'react';
import { motion } from 'framer-motion';
import BillsTable from './components/BillsTable';
import styles from './bills.module.sass';
import { opacityTransition } from '../../utils/motion.variants';

const Bills = () => {
  return (
    <motion.div
      variants={opacityTransition}
      initial="hidden"
      animate="show"
      className={styles.container}
    >
      <BillsTable />
    </motion.div>
  );
};

export default Bills;
