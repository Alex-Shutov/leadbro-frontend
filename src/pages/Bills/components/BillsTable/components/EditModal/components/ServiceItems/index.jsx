import React from 'react';
import styles from './ServiceItems.module.sass';
import cn from 'classnames';
import Icon from '../../../../../../../../shared/Icon';
import TextInput from '../../../../../../../../shared/TextInput';
import Dropdown from '../../../../../../../../shared/Dropdown/Default';
import { measurementUnitTypesRu } from '../../../../../../bills.types';
import Button from '../../../../../../../../shared/Button';

const ServiceItems = ({ items = [], onChange }) => {
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onChange(newItems);
  };
  console.log(items);

  const addItem = () => {
    const newItems = [
      ...items,
      {
        id: items.length + 1,
        isNew: true,
        name: '',
        price: '',
        quantity: '',
        measurementUnit: 'pcs',
      },
    ];
    onChange(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, idx) => idx !== index);
    onChange(newItems);
  };

  return (
    <div className={styles.services_container}>
      {items.map((item, index) => (
        <div key={index} className={styles.service_item}>
          <div className={styles.service_header}>
            <h3 className={styles.service_title}>Услуга {index + 1}</h3>
            <button
              className={styles.delete_button}
              onClick={() => removeItem(index)}
            >
              <span>Удалить услугу</span>
              <Icon name="trash" />
            </button>
          </div>

          <div className={styles.service_grid}>
            <div className={styles.input_group}>
              <TextInput
                label="Название"
                placeholder="Введите услугу"
                name={'name'}
                value={item.name}
                onChange={(e) =>
                  handleItemChange(index, 'name', e.target.value)
                }
                edited={true}
              />

              <TextInput
                label="Цена без НДС"
                placeholder="Цена услуги"
                name={'price'}
                value={item.price}
                type="number"
                onChange={(e) =>
                  handleItemChange(index, 'price', parseFloat(e.target.value))
                }
                edited={true}
              />
            </div>

            <div className={styles.input_group}>
              <TextInput
                label="Количество"
                placeholder="Кол-во услуг"
                value={item.quantity}
                type="number"
                onChange={(e) =>
                  handleItemChange(index, 'quantity', parseInt(e.target.value))
                }
                edited={true}
              />
              <Dropdown
                label="Единица измерения"
                value={measurementUnitTypesRu[item.measurementUnit]}
                setValue={(value) =>
                  handleItemChange(
                    index,
                    'measurementUnit',
                    Object.keys(measurementUnitTypesRu).find(
                      (key) => measurementUnitTypesRu[key] === value,
                    ),
                  )
                }
                options={Object.values(measurementUnitTypesRu)}
              />
            </div>
          </div>
        </div>
      ))}

      <div className={styles.add_service_button} onClick={addItem}>
        <span>Добавить услугу</span>
        <Button
          isSmallButton={true}
          adaptiveIcon={<Icon size={16} viewBox={'0 0 16 16'} name={'add'} />}
          classname={cn(styles.add_button)}
          name={'Создать отчет'}
        />
      </div>
    </div>
  );
};

export default ServiceItems;
