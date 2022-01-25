import favicons from "gulp-favicons"; // создание фавиконок
import filter from "gulp-filter"; // вынесение части файлов в основную директорию


export const favicon = () => {
	return app.gulp
		.src(app.path.src.favicon)
		.pipe(app.plugins.plumber(
			app.plugins.notify.onError({
        		title: "FAVICON",
				message: "Error: <%= error.message %>",
			})
		)
    ) //выведение ошибок
	.pipe(app.gulp.dest(app.path.build.favicon))
    // закинули в папку с результатом оригинал
	.pipe(favicons({
		appName: `Rusagro`,
		appShort_name: `Rusagro`,
		appDescription: `Rusagro один из крупнейших производителей сахара в России`,
		icons: {
			favicons: true,
			appleIcon: true,
			android: true,
			safari: true,
			windows: false,
			yandex: false,
			coast: false,
			appleStartup: false
		}, 
		path: "./favicon/"
	})) // создали фавиконки
    .pipe(app.gulp.dest(app.path.build.favicon))
    // закинули в папку с результатом
	.pipe(filter(['favicon.ico', 'apple-touch-icon.png', 'manifest.json']))
	.pipe(app.gulp.dest(app.path.build.html));
};
