<?php
// Проверяем, что запрос пришел методом POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получаем данные из формы
    $license_plate = $_POST['number_'] ?? '';
    $vehicle = $_POST['vehicle'] ?? '';
    $arrival_date = $_POST['arrival'] ?? '';
    $driver_name = $_POST['driverName'] ?? '';
    $passport_series = $_POST['passport_series'] ?? '';
    $passport_number = $_POST['passport_number'] ?? '';
    $issued_by = $_POST['issued_by'] ?? '';
    $issue_date = $_POST['issue_date'] ?? '';

    // Валидация данных
    $errors = [];

    $license_pattern = '/^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}$/u';
    if (empty($license_plate) || !preg_match($license_pattern, $license_plate)) {
        $errors[] = "Некорректный гос-номер";
    }

    if (empty($passport_series) || strlen($passport_series) !== 4) {
        $errors[] = "Некорректная серия паспорта";
    }

    if (empty($passport_number) || strlen($passport_number) !== 6) {
        $errors[] = "Некорректный номер паспорта";
    }

    if (empty($driver_name)) {
        $errors[] = "Не указано ФИО водителя";
    }

    // Если есть ошибки, возвращаем их на страницу формы
    if (!empty($errors)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'errors' => $errors]);
        exit;
    }

    // Формируем строку с данными
    $data = sprintf(
        "Дата записи: %s\nГос-номер: %s\nТранспортное средство: %s\nДата прибытия: %s\nВодитель: %s\n" .
        "Паспорт: %s %s\nКем выдан: %s\nКогда выдан: %s\n\n",
        date('Y-m-d H:i:s'),
        $license_plate,
        $vehicle,
        $arrival_date,
        $driver_name,
        $passport_series,
        $passport_number,
        $issued_by,
        $issue_date
    );

    // Путь к файлу (измените на нужный)
    $file = 'vehicle_records.txt';

    // Пытаемся записать данные в файл
    if (file_put_contents($file, $data, FILE_APPEND | LOCK_EX) !== false) {
        // Очищаем localStorage после успешной записи
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Данные успешно сохранены']);
    } else {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'errors' => ['Ошибка при сохранении данных']]);
    }
} else {
    // Если запрос пришел не методом POST
    header('HTTP/1.1 405 Method Not Allowed');
    echo 'Метод не разрешен';
}
?>