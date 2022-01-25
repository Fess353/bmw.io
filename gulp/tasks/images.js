import webp from "gulp-webp"; // создание webp изображений
import imagemin from "gulp-imagemin"; // оптимизируем изображения 


export const images = () => {
	return app.gulp.src(app.path.src.images)
		.pipe(app.plugins.plumber(
			app.plugins.notify.onError({
        		title: "IMAGES",
				message: "Error: <%= error.message %>",
			})
		)
    ) //выведение ошибок
    .pipe(app.plugins.newer(app.path.build.images)) //проверили наличие изображений
    .pipe(
		app.plugins.if(
			app.isBuild, webp()
			)
		) // создали webp изображения
    .pipe(
		app.plugins.if(
        	app.isBuild, app.gulp.dest(app.path.build.images)
      	)
    ) // закинули в папку с результатом
    .pipe(app.plugins.newer(app.path.build.images)) // опять провериили наличие изображений
    .pipe(
		app.plugins.if(
			app.isBuild,
				imagemin({
					progressive: true,
					svgoPlugins: [{ removeViewBox: false }],
					interlaced: true,
					optimizationLevel: 2 // от 0 до 7
        		}
			)
      	)
    )
    // оптимизируем изображения в режиме Билд
    .pipe(app.gulp.dest(app.path.build.images)) // опять выгружаем
    .pipe(app.gulp.src(app.path.src.svg)) //получаем доступ к свг
    .pipe(app.gulp.dest(app.path.build.images)) // выгружаем свг
    .pipe(app.plugins.browsersync.stream()); // следим...
};
