// Функция маппинга данных
import {createBlob} from "../../utils/create.utils";

const mapBackendToMock = (backendData: any[]) => {
    return backendData.map((item) => ({
        id: item.id,
        image: item.avatar ? `https://api.lead-bro.ru${item.avatar}` : createBlob(), // Если есть аватар, используем его, иначе создаем blob
        name: item.name,
        surname: item.lastName,
        role: item.position?.name || 'Без должности', // Если должность есть, берем её, иначе присваиваем значение по умолчанию
        originalData: item // Сохраняем исходные данные, если нужно для других целей
    }));
};

export default mapBackendToMock;