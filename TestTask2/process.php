
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $license_plate = $_POST['number'] ?? '';
    $vehicle = $_POST['vehicle'] ?? '';
    $arrival_date = $_POST['arrival'] ?? '';
    $driver_name = $_POST['driverName'] ?? '';
    $passport_series = $_POST['passportSeries'] ?? '';
    $passport_number = $_POST['passportNumber'] ?? '';
    $issued_by = $_POST['givenBy'] ?? '';
    $issue_date = $_POST['givenDate'] ?? '';

    // перед дальнейшим использованием данных должна проходить проверка для защиты от SQL-инъекций и так далее

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
    if (empty($vehicle)) {
        $errors[] = "Не указано транспортное средство";
    }

    if (!empty($errors)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'errors' => $errors]);
        exit;
    }

    // Абстрактная запись данных в базу
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

    $file = 'vehicle_records.txt';

    if (file_put_contents($file, $data, FILE_APPEND | LOCK_EX) !== false) {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Данные успешно сохранены']);
    } else {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'errors' => ['Ошибка при сохранении данных']]);
    }
} else {
    header('HTTP/1.1 405 Method Not Allowed');
    echo 'Метод не разрешен';
}
?>