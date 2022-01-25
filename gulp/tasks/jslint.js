import eslint from "gulp-eslint";

export const jsLint = () => {
	return app.gulp
		.src(app.path.src.jsLint)
		.pipe(app.plugins.plumber(
			app.plugins.notify.onError({
				title: "JS LINT",
				message: "Error: <%= error.message %>",
			})
		)) //выведение ошибок
		.pipe(
			// Проверка линтом
			eslint({
				globals: ['jQuery', '$']
			})
		)
		.pipe(eslint.format()) // Вывод ошибок в консоль
}