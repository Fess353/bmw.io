//получаем имя папки проекта
import * as nodePath from 'path';
const rootFolder = nodePath.basename(nodePath.resolve());

const buildFolder = './dist';
const srcFolder = './src';

// создаем и экспортируем объект путей для использования в других файлах
export const path = {
    //объект путей к папке с результатом
    build: {
        js: `${buildFolder}/js/`,
        css: `${buildFolder}/css/`,
        csslibs: `${buildFolder}/css/libs/`,
        jslibs: `${buildFolder}/js/libs/`,
        html : `${buildFolder}/`,
        images: `${buildFolder}/`,
        fonts: `${buildFolder}/fonts/`,
        files: `${buildFolder}/files/`,
        favicon: `${buildFolder}/favicon/`
    },
    // объект путей к папке с источником
    src: {
        csslibs: `${srcFolder}/css/libs/*.css`,
        jslibs: `${srcFolder}/js/libs/*.js`,
        js: `${srcFolder}/js/app.js`,
        images: `${srcFolder}/**/*.{jpg,jpeg,png,gif,webp}`,
        svg: `${srcFolder}/**/*.svg`,
        scss: `${srcFolder}/scss/**/*.scss`,
        html: `${srcFolder}/*.html`,
        files: `${srcFolder}/files/**/*.*`,
        favicon: `${srcFolder}/favicon/favicon.svg`,
        sassLint: [
			`${srcFolder}/scss/**/*.scss`,
			`!${srcFolder}/scss/libs/*.scss`,
		],
        jsLint: [
			`${srcFolder}/js/**/*.js`,
			`!${srcFolder}/js/libs/*.js`,
		]
    }, 
    //объект путей за которыми галп следит
    watch: {
        csslibs: `${srcFolder}/css/libs/`,
        jslibs: `${srcFolder}/js/libs/`,
        js: `${srcFolder}/js/**/*.js`, 
        images: `${srcFolder}/**/*.{jpg,jpeg,png,gif,webp,svg}`,
        scss: `${srcFolder}/scss/**/*.scss`, 
        html: `${srcFolder}/**/*.html`, 
        files: `${srcFolder}/files/**/*.*`,
        favicon: `${srcFolder}/favicon/favicon.svg`,
        sassLint: [
			`${srcFolder}/scss/**/*.scss`,
			`!${srcFolder}/scss/libs/*.scss`,
		],
        jslint: [
			`${srcFolder}/js/**/*.js`,
			`!${srcFolder}/js/libs/*.js`,
		]
    }, 
    clean: buildFolder,
    buildFolder: buildFolder,
    srcFolder: srcFolder,
    rootFolder: rootFolder,
    ftp: ''
} 