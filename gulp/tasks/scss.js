import dartSass from "sass";
import gulpSass from "gulp-sass";
import rename from "gulp-rename"; //переименование файлов
import cleanCss from "gulp-clean-css"; //Сжатие CSS файлов
import webpcss from "gulp-webpcss"; // Вывод WEB изображений
import autoprefixer from "gulp-autoprefixer"; // Добавление вендорных префиксов
import groupCssMediaQueries from "gulp-group-css-media-queries"; // Группировка медиа запросов
import sourcemaps from "gulp-sourcemaps";

//вызываем сасс с передачей в него компилятора
const sass = gulpSass(dartSass);

export const scss = () => {
	return app.gulp
		.src(app.path.src.scss)
		.pipe(sourcemaps.init())
		.pipe(app.plugins.plumber(
				app.plugins.notify.onError({
					title: "SCSS",
					message: "Error: <%= error.message %>",
				})
			)
		) //выведение ошибок
		.pipe(app.plugins.replace(/@img\//g, '../img/')) //замена путей картинок
		.pipe(sass({
			outputStyle: 'expanded',
			indentType: 'tab',
			indentWidth: 1
		})) //скомпилировали сасс
		.pipe(
			app.plugins.if(
				app.isBuild, groupCssMediaQueries()
			)
		) //сгруппировали медиа запросы в режиме билд
		.pipe(webpcss({
			webpClass: '.webp',
			noWebpClass: '.no-webp'
		}))
		.pipe(autoprefixer({
			grid: true, //включаем поддержку гридов
			overrideBrowsersList: ["last 3 versions"],
			cascade: true
		})) //добавляем вендорныые префиксы
		.pipe(app.gulp.dest(app.path.build.css)) //раскомментировать если нужен не сжатый файл стилей
		.pipe(cleanCss())
		.pipe(rename({
			extname: ".min.css"
		})) // меняем название на мин-цсс
		.pipe(app.plugins.if(!app.isBuild, sourcemaps.write()))
		.pipe(app.gulp.dest(app.path.build.css))
		.pipe(app.plugins.browsersync.stream());
};
 // получаем доступ к файлу, используем карты исходников чтобы в анализе стиля блока видеть откуда стиль. Выгружаем в результат, обновляем браузер

