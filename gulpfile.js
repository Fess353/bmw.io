// основной модуль
import gulp from "gulp";

// импорт путей
import { path } from "./gulp/config/path.js";

// импорт общих плагинов
import { plugins } from "./gulp/config/plugins.js";

// передаем значения в глобальную переменную
global.app = {
    isBuild: process.argv.includes('--build'),
    isDev: !process.argv.includes('--build'),
    path: path,
    gulp: gulp,
    plugins: plugins
}

// импорт задач из файлов js
import { copy } from "./gulp/tasks/copy.js";
import { reset } from "./gulp/tasks/reset.js";
import { html } from "./gulp/tasks/html.js";
import { server } from "./gulp/tasks/server.js";
import { scss } from "./gulp/tasks/scss.js";
import { libs } from "./gulp/tasks/libs.js";
import { jslibs } from "./gulp/tasks/jslibs.js";
import { js } from "./gulp/tasks/js.js";
import { images } from "./gulp/tasks/images.js";
import { otfToTtf, ttfToWoff, fontsStyle } from "./gulp/tasks/fonts.js";
import { favicon } from "./gulp/tasks/favicon.js";
import { styleLint } from "./gulp/tasks/stylelint.js";
import { jsLint } from "./gulp/tasks/jslint.js";


// наблюдатель за изменениями в файлах
function watcher () { 
    gulp.watch(path.watch.files, copy); //передаем путь к файлам за которыми надо следить и действие для выполнения
    gulp.watch(path.watch.html, html); // следим за изменениями в html
    gulp.watch(path.watch.scss, scss); // следим за изменениями в scss
    gulp.watch(path.watch.js, gulp.parallel(js, jsLint)); // следим за изменениями в js
    gulp.watch(path.watch.images, images); // следим за изменениями в js
    gulp.watch(path.watch.favicon, favicon); // следим за изменениями в favicon
}

//Последовательная обработка шрифтов
const fonts = gulp.series(otfToTtf, ttfToWoff, fontsStyle);

// сокращения
const serverWatch = gulp.parallel(watcher, server);
const lint = gulp.series(styleLint, jsLint); 

// Основные задачи
const mainTasks = gulp.series(fonts, gulp.parallel(copy, html, scss, js, images, favicon, libs, jslibs));  //одновременное выполнение задач



//  построение сценариев выполнения задач
// в режиме разработчика метод последовательного выполнения  - очистка папки с результатом, линты, основные действия, включаем параллельно наблюдатель и браузерсинк
const dev = gulp.series(reset, lint, mainTasks, serverWatch); 

// в режиме билда - только очистка и основные действия, без наблюдателей и сервера
const build = gulp.series(reset, mainTasks); 


// экспорт сценариев для видимости извне
export { dev };
export { build };

export { reset };
export { serverWatch };
export { html };


// выполнение сценария по умолчанию
gulp.task('default', dev);



// fs from 'fs';
// ttf2woff2 from 'gulp-ttf2woff2';
// fonter from 'gulp-fonter';
// fileInclude from "gulp-file-include";
// webpHtmlNoSvg from "gulp-webp-html-nosvg";
// versionNumber from "gulp-version-number";
// dartSass from "sass";
// gulpSass from "gulp-sass";
// rename from "gulp-rename";  //переименование файлов
// cleanCss from "gulp-clean-css";  //Сжатие CSS файлов
// webpcss from "gulp-webpcss";  // Вывод WEB изображений
// autoprefixer from "gulp-autoprefixer";  // Добавление вендорных префиксов
// groupCssMediaQueries from "gulp-group-css-media-queries";  // Группировка медиа запросов
// replace from "gulp-replace"; // поиск и замена
// plumber from "gulp-plumber"; // обработка ошибок
// notify from "gulp-notify"; // Сообщения - подсказки
// browsersync from "browser-sync"; // выведение в бразуер, автообновление
// newer from "gulp-newer"; // проверка обновления картинок во избежание дублирования
// webp from "gulp-webp";
// imagemin from "gulp-imagemin";
// webpack from "webpack-stream";
// del from "del"; 
// favicons from "gulp-favicons"; // создание фавиконок под разные браузеры
// filter from "gulp-filter"; // вынесение части файлов из директории фавиконок в основную директорию