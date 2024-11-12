import React from 'react';
import { useDrag } from 'react-dnd';
import styles from '../DealsList/List.module.sass';
import Card from '../../../../../../../../shared/Card';
import Avatar from '../../../../../../../../shared/Avatar';

const DealCard = ({ deal }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'DEAL',
    item: { id: deal.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatName = (person) => {
    if (!person) return '';
    return `${person.lastName} ${person.name.charAt(0)}. ${person.middleName.charAt(0)}.`;
  };

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className={styles.deal}>
        <div className={styles.deal_source}>{deal.source}</div>
        <div className={styles.deal_name}>{deal.name}</div>
        <div className={styles.deal_price}>{formatPrice(deal.price)}</div>
        <div className={styles.deal_footer}>
          <div className={styles.deal_assignee}>
            {deal.responsible && (
              <>
                <Avatar
                  className={styles.avatar}
                  imageSrc={deal.responsible.image}
                  size={24}
                />
                <span className={styles.deal_assignee_name}>
                  {formatName(deal.responsible)}
                </span>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DealCard;
