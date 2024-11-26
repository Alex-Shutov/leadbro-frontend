export const getFormattedTimeType = (type) => {
  switch (type) {
    case 'часов':
      return 'ч';
    case 'минут':
      return 'мин';
    case 'дней':
      return 'дн';
    default:
      return '';
  }
};

export const convertToMinutes = (time) => {
  const timeValue = parseFloat(time);
  if (Number.isNaN(timeValue)) {
    return null;
  }
  if (time.includes('ч')) {
    return timeValue * 60;
  } else if (time.includes('м')) {
    return timeValue;
  } else if (time.includes('дн')) {
    return timeValue * 1440; // 1 день = 1440 минут (24 часа * 60 минут)
  } else if (time.includes('нед')) {
    return timeValue * 10080; // 1 неделя = 10080 минут (7 дней * 1440 минут)
  } else {
    //TODO Возможно имзеинть возврат или кидать ошибку
    return null; // если не удалось распознать единицу времени, возвращаем null
  }
};

export const convertToHours = (time) => {
  const timeValue = parseFloat(time);
  if (Number.isNaN(timeValue)) {
    return null;
  }
  return timeValue
  // if (time.includes('ч')) {
  //   return timeValue;
  // } else if (time.includes('м')) {
  //   return timeValue / 60;
  // } else if (time.includes('дн')) {
  //   return timeValue * 24; // 1 день = 24 часа
  // } else if (time.includes('нед')) {
  //   return timeValue * 168; // 1 неделя = 168 часов (7 дней * 24 часа)
  // } else {
  //   // TODO: Возможно изменить возврат или кидать ошибку
  //   return null; // если не удалось распознать единицу времени, возвращаем null
  // }
};
