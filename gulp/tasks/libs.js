export const libs = () => {
	return app.gulp
		.src(app.path.src.csslibs)
		.pipe(app.plugins.plumber(
				app.plugins.notify.onError({
					title: "LIBS",
					message: "Error: <%= error.message %>",
				})
			)
		) //выведение ошибок
		.pipe(app.gulp.dest(app.path.build.csslibs))
}; 
