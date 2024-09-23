import { isId } from './is.type';
import {handleError} from "./snackbar";

export function updateObjectRecursively(draft, oldObject, newObject) {
  if (draft === oldObject) {
    return newObject;
  }

  if (Array.isArray(draft)) {
    return draft.map((item) =>
      updateObjectRecursively(item, oldObject, newObject),
    );
  }
  // Тут кстати будет уместно в теории следующее - если мы изменили объект, то мы нашли что искали и можно выходить из функции
  if (typeof draft === 'object' && !(draft instanceof Date) && draft !== null) {
    /// проверят, не строка ли Если строка то возвращать ее

    const updatedDraft = { ...draft };
    for (const key in updatedDraft) {
      if (key === 'services') {
      }
      updatedDraft[key] = updateObjectRecursively(
        updatedDraft[key],
        oldObject,
        newObject,
      );
    }
    return updatedDraft;
  }

  return draft;
}

export const getValueByPath = (obj, path) => {
  return path.split('.').reduce((acc, part) => {
    return acc ? acc[part] : undefined;
  }, obj);
};

export function updateDraftObject(id, store, oldDraft, newDraft) {
  const draft = store.drafts[id];
  store.drafts = {
    ...store.drafts,
    [id]: updateObjectRecursively(draft, oldDraft, newDraft),
  };
}

export const changeDraft = (store, id, object, path, value, withId) => {
  // const pathParts = path.split('.');
  // let currentValue = object;
  //
  // for (let i = 0; i < pathParts.length - 1; i++) {
  //     const part = pathParts[i];
  //     if (Array.isArray(currentValue) && isId(part)) {
  //         const index = Number(part);
  //         const nextValue = currentValue.find(x => x.id === index);
  //         if (!nextValue) {
  //             const newValue = [...currentValue, { id: index }];
  //             currentValue = newValue;
  //         } else {
  //             currentValue = nextValue;
  //         }
  //     } else {
  //         if (!currentValue[part]) {
  //             currentValue = { ...currentValue, [part]: {} };
  //         }
  //         currentValue = currentValue[part];
  //     }
  // }
  //
  // const lastPart = pathParts[pathParts.length - 1];
  // return { ...currentValue, [lastPart]: value };
  const pathParts = path.split('.');
  let currentDraft = store.drafts[id];

  // Обновляем вложенные объекты в черновике
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (Array.isArray(currentDraft) && isId(part)) {
      const index = Number(part);
      const nextDraft = currentDraft.find((x) => x.id === index);
      if (!nextDraft) {
        const newDraft = [...currentDraft, { id: index }];
        updateDraftObject(id, store, currentDraft, newDraft);
        currentDraft = newDraft.find((x) => x.id === index);
      } else {
        currentDraft = nextDraft;
      }
    } else {
      if (!currentDraft[part]) {
        const newDraft = { ...currentDraft, [part]: {} };
        updateDraftObject(id, store, currentDraft, newDraft);
        currentDraft = newDraft[part];
      } else {
        currentDraft = currentDraft[part];
      }
    }
  }
  const lastPart = pathParts[pathParts.length - 1];
  const newDraft = withId
    ? { ...currentDraft, [lastPart]: value }
    : [...currentDraft, value];
  updateDraftObject(id, store, currentDraft, newDraft);
};

export function resetDraft(store, id, object, path) {
  const client = object;
  if (!client) return;

  // const pathParts = path.split('.');
  // let currentValue = client;

  // for (let i = 0; i < pathParts.length; i++) {
  //     const part = pathParts[i];
  //     if (Array.isArray(currentValue)) {
  //         if (!isId(part)) return;
  //         const index = Number(part);
  //         currentValue = currentValue.find(x => x.id === index);
  //         if (!currentValue) return;
  //     } else if (typeof currentValue === "object" && currentValue !== null) {
  //         if (!currentValue.hasOwnProperty(part)) return;
  //         currentValue = currentValue[part];
  //     } else {
  //         return;
  //     }
  // }

  // const lastPart = pathParts[pathParts.length - 1];
  const newDraft = client;
  // delete newDraft[lastPart];

  updateDraftObject(id, store, store.drafts[id], newDraft);
}

export const removeDraft = (store, id, path) => {
  const pathParts = path.split('.');
  let currentDraft = store.drafts[id];

  // Обновляем вложенные объекты в черновике
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (Array.isArray(currentDraft) && isId(part)) {
      const index = Number(part);
      const nextDraft = currentDraft.find((x) => x.id === index);
      if (!nextDraft) return; // Если элемент массива не найден, выходим
      currentDraft = nextDraft;
    } else {
      if (!currentDraft[part]) return; // Если свойство не существует, выходим
      currentDraft = currentDraft[part];
    }
  }

  // Удаляем последнее свойство из черновика
  const lastPart = pathParts[pathParts.length - 1];
  const newDraft = { ...currentDraft };
  delete newDraft[lastPart];
  updateDraftObject(id, store, currentDraft, newDraft);
};

export const mapChangedFieldsForBackend = (
  drafts,
  changedFieldsSet,
  mapKeyToBackend,
  castValue,
) => {
  const body = {};

  changedFieldsSet.forEach((key) => {
    // Получаем значение по пути из `drafts`
    const value = getValueByPath(drafts, key);
    if (value !== undefined) {
      // Получаем маппленный ключ для бэкэнда
      const backendKey = mapKeyToBackend(key,drafts);

      // Приводим значение к нужному типу и добавляем в объект для отправки
      body[backendKey] = castValue(backendKey, value);
    }
  });

  return body;
};

export const mapFio = (drafts,changedFieldsSet,propId) => {
   const mapped = [...changedFieldsSet].map(key=> {
    if (key === `contactPersons.${propId}.fio`) {
      const fio = getValueByPath(drafts, key).trim(); // Получаем ФИО и убираем лишние пробелы
      const parts = fio.split(' ').filter(Boolean); // Разбиваем на части по пробелам

      if (parts.length === 1) {
        handleError('Некорректное ФИО: должно содержать хотя бы имя и фамилию');
        return;
      } else if (parts.length > 3) {
        handleError('Некорректное ФИО: слишком много частей');
        return;
      }

      // Маппинг частей ФИО на ключи
      const [last_name, name, middle_name] = parts;
      return {
        last_name,
        name,
        middle_name: middle_name || '', // Отчество может быть отсутствовать
      };
    } else return null
  })
  return mapped[0]
}
