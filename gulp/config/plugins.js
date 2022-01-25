import replace from "gulp-replace"; // поиск и замена
import plumber from "gulp-plumber"; // обработка ошибок
import notify from "gulp-notify"; // Сообщения - подсказки
import browsersync from "browser-sync"; // выведение в бразуер, автообновление
import newer from "gulp-newer"; // проверка обновления картинок во избежание дублирования
import ifPlugin from "gulp-if"; // условное ветвление для режимов дев-прод


// создаем и экспортируем объект, в него собираем плагины
export const plugins = {
    replace: replace,
    plumber: plumber,
    notify: notify,
    browsersync: browsersync,
    newer: newer,
    if: ifPlugin
}