import fileInclude from "gulp-file-include";
import webpHtmlNoSvg from "gulp-webp-html-nosvg";
import versionNumber from "gulp-version-number";
import GulpWebpHtml2 from "gulp-webp-in-html";

export const html = async () => {
	return app.gulp
		.src(app.path.src.html)
		.pipe(
			app.plugins.plumber(
				app.plugins.notify.onError({
					title: "HTML",
					message: "Error: <%= error.message %>",
				})
			)
		) //выведение ошибок
		.pipe(fileInclude({
			indent: true
		})) //собрали из частей
		.pipe(app.plugins.replace(/@img\//g, "./img/")) //ищем все вхождения записи по регулярке и меняем
		// .pipe(app.plugins.if(app.isBuild, webpHtmlNoSvg()) //работа с webP - кроме SVG, доп обертка для изображений как picture-source с сохранением оригинала
		// )
		.pipe(
			app.plugins.if(
				app.isBuild,
				versionNumber({
					value: "%DT%",
					append: {
						key: "_v",
						cover: 0,
						to: ["css", "js"],
					},
					output: {
						file: "gulp/version.json",
					},
				})
			)
		) //исправление проблем с кешированием в билд режиме
		.pipe(app.gulp.dest(app.path.build.html))
		.pipe(app.plugins.browsersync.stream());
};