export const jslibs = () => {
	return app.gulp
		.src(app.path.src.jslibs)
		.pipe(app.plugins.plumber(
				app.plugins.notify.onError({
					title: "JSLIBS",
					message: "Error: <%= error.message %>",
				})
			)
		) //выведение ошибок
		.pipe(app.gulp.dest(app.path.build.jslibs))
}; 
