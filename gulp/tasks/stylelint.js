import stylelint from "gulp-stylelint";

export const styleLint = () => {
	return app.gulp
		.src(app.path.src.sassLint)
		.pipe(app.plugins.plumber(
			app.plugins.notify.onError({
				title: "StyleLint",
				message: "Error: <%= error.message %>",
			})
		)) //выведение ошибок
		.pipe(stylelint({
			reporters: [{
				formatter: 'string',
				console: true
			}]
		}));
} 