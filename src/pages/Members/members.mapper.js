// Функция маппинга данных
import {loadAvatar} from "../../utils/create.utils";

const mapBackendToMock = (backendData: any[]) => {
    return backendData.map((item) => ({
        id: item.id,
        image: item.avatar ? loadAvatar(item.avatar) : loadAvatar(), // Если есть аватар, используем его, иначе создаем blob
        name: item.name,
        surname: item.last_name,
        middleName:item.middle_name ?? '',
        role: item.position?.name || 'Без должности', // Если должность есть, берем её, иначе присваиваем значение по умолчанию
        originalData: item // Сохраняем исходные данные, если нужно для других целей
    }));
};

export default mapBackendToMock;