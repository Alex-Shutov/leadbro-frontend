export const getQueryParam = (param, defaultValue = null) => {
    const searchParams = new URLSearchParams(window.location.search);

    // Получаем значение параметра
    const value = searchParams.get(param);

    // Если параметр найден, возвращаем его. Если нет, возвращаем дефолтное значение.
    return value !== null ? value : defaultValue;
};
