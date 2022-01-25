'use strict';

import {
	enableBodyScroll,
	disableBodyScroll
} from '@funboxteam/diamonds';

// Настройка вспомогательных переменных
function updateDeviceProps(rootSelector) {
	var vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', vh + 'px');

	var root = document.querySelector(rootSelector);
	var scrollWidth = window.innerWidth - root.clientWidth;
	document.documentElement.style.setProperty(
		'--scroll-width',
		scrollWidth + 'px'
	);
}
window.addEventListener('resize', function () {
	updateDeviceProps('body');
});
updateDeviceProps('body');

/* Перегоняем СВГ в инлайновый для возможности правки цвета */
function imgToSvg() {
	$('img.img-svg').each(function () {
		var $img = $(this);
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');
		$.get(
			imgURL,
			function (data) {
				var $svg = $(data).find('svg');
				if (typeof imgClass !== 'undefined') {
					$svg = $svg.attr('class', imgClass + ' replaced-svg');
				}
				$svg = $svg.removeAttr('xmlns:a');
				if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
					$svg.attr(
						'viewBox',
						'0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width')
					);
				}
				$img.replaceWith($svg);
			},
			'xml'
		);
	});

};
$('body').on('DOMNodeInserted', imgToSvg);


//Объявление основных переменных
let currentSlideIndex = 0;
let popup = $('.page__popup');
let popupBody = $('.popup__body');
let popupTitle = $('.popup__title');
let popupThanks = $('.popup__thanks');
let popupDesc = $('.popup__description');

let arrowRight = $('.slide__arrow_right');
let arrowLeft = $('.slide__arrow_left');

let maxSlidesNum;
let offset = 0;
let limit = 3;
let slideUrl = 'https://private-anon-449a84c19b-grchhtml.apiary-mock.com/slides';
let swiper;


// Промотать изображение на слайде по горизонтали для фокуса на машине
function scrollImagesToStartPos() {
	let image = $('.slide__image').eq(currentSlideIndex);
	let slideOffsetScroll = image.width() * 0.166;
	image.parent().scrollLeft(slideOffsetScroll)
}

// Показать Попап
function showPopup() {
	popup.removeClass('page__popup_hidden');
	popupBody.removeClass('popup__body_hidden');
	disableBodyScroll();
}

// Спрятать Попап
function hidePopup() {
	popup.addClass('page__popup_hidden');
	popupBody.addClass('popup__body_hidden');
	enableBodyScroll();
}

// Изменение текста в Попапе при успешном запросе
function changePopupToSuccess(data) {
	popupTitle.text(data.title);
	popupThanks.text(data.desc);
	popupDesc.text($('.slide__description', swiper.slides[swiper.realIndex]).eq(0).text());
}

// Изменение текста в Попапе при ошибке в запросе
function changePopupToFail() {
	popupTitle.text('Ошибка запроса');
	popupThanks.text('Простите. Не удалось поставить "лайк", но Вы можете попробовать еще раз ^_^. Почитайте пока про BMW!');
	popupDesc.text($('.slide__description', swiper.slides[swiper.realIndex]).eq(0).text());
}

// Изменения состояния кнопки Лайк на активное, добавление +1 к каунтеру с таймаутом под анимацию для незаметности изменения числа
function changeLikeState() {
	let like = $(`.like__button[data-id=${currentSlideIndex}]`);
	like.addClass('like__button_active');

	let counter = like.siblings('.like__counter');
	let num = counter.children('.like__text_orange')

	setTimeout(() => {
		num.text(parseInt(num.text()) + 1);
	}, 300);
}

// Изменить информацию в Попапе, передаем в нее ID слайда
// При успешном завершении формируем Попап с содержанием с сервера, показываем его,записываем куки, делаем лайк активным
// При фейле формируем попап-ошибку, показываем
function likeSlide(id) {
	let url = `https://private-anon-5e887a7962-grchhtml.apiary-mock.com/slides/${id}/like`

	$.ajax({
		url: url,
		method: 'post',
		dataType: 'json',
		success: function (data) {
			changePopupToSuccess(data);
			showPopup();
			changeLikeState();
			setLikeCookie(id);
		},
		error: function () {
			changePopupToFail();
			showPopup();
		}
	});
};

// Вешаем слушатели
$(function () {
	//Слушатель на кнопку Лайк. Если активен - отбой. Передаем ID слайда в функцию Лайка
	$(document).on('click', '.js-like__button', function () {
		if ($(this).hasClass('like__button_active')) {
			return
		}

		let id = $(this).attr('data-id');
		likeSlide(id);
	});

	// Слушатель на кнопку закрыть и блекскрин попапа на закрытие
	$(document).on('click', ('.popup__close-button, .popup__blackscreen'), function () {
		hidePopup();
	});
});

// Обработка ошибок изображений, замена на заглушку
HTMLImageElement.prototype.imgError = function () {
	$(this)
		.addClass('slide__image_hidden')
		.siblings('.slide__plug').addClass('slide__plug_visible');
};

// Функция обрезки элемента, сравнение с высотой родителя.
// Если больше - добавляем элементу модификатор
// Передаем в подсказку текст элемента и делаем видимой подсказку при наведении
async function truncateElement(classname) {
	let element = $(`${classname}`);
	element.each(function () {
		if ($(this).height() > $(this).parent().height()) {
			$(this).addClass(`${($(this).attr("class").split(/\s+/)[0])}_truncated`)

			$(this)
				.siblings('.tooltip')
				.attr('tooltip', $(this).text())
				.addClass(`tooltip_visible`);
		}
	})
}
$('body').on('DOMNodeInserted', function () {
	// truncateElement('.slide__description-text');
	truncateElement('.slide__title-text');
});

// Создание нового слайда по Темплейту. Создаем клон, формируем элементы по информации из объекта, добавляем ID на кнопку лайка, передаем клон в свайпер, обновляем свайпер
let k = 0;

function createSlideByTemplate() {
	let template = document.querySelector('.page__template');
	let clone = template.content.cloneNode(true);

	let title = clone.querySelector('.slide__title');
	title.textContent = this.title;

	let description = clone.querySelector('.slide__description-text');
	description.textContent = this.desc;

	let image = clone.querySelector('.slide__image');
	image.src = this.imgUrl;

	if (k === 0) {
		let imgWrapper = clone.querySelector('.slide__image-wrapper');
		imgWrapper.classList.remove('right');

		let like = clone.querySelector('.slide__like');
		like.classList.remove('slide__like_hidden');

		description.classList.remove('slide__description-text_hidden');
		k++;
	};

	let likeCounter = clone.querySelector('.like__text_orange');
	likeCounter.textContent = this.likeCnt;

	let like = clone.querySelector('.like__button');
	like.setAttribute('data-id', this.id);

	swiper.appendSlide(clone);
	swiper.update();
}

// Набор функций после запуска
function startFunctions() {
	changeArrowsOpacity();
	scrollImagesToStartPos();
	setLikeStateByCookie(currentSlideIndex);
}


// Делаем ajax запрос на сервер
// При успехе - формируем слайды и альтернативные заголовки на уровень выше, единоразово запускаем стартовые функции
let j = 0;

function fetchServer(urlAdress, offsetNumber, limitNumber) {
	let urlElement = '';
	if (offsetNumber !== undefined && limitNumber !== undefined) {
		urlElement = `?offset=${offsetNumber}&limit=${limitNumber}`;
	}

	let url = urlAdress + urlElement;
	console.log('url ' + url);

	$.ajax({
		url: url,
		method: 'get',
		dataType: 'json',
		success: function (data) {
			console.log(data.data);
			maxSlidesNum = data.countAll;
			$.each(data.data, createSlideByTemplate);
			$.each(data.data, createAltTitles);

			if (j === 0) {
				startFunctions();
				j++;
			}
		},
		error: function () {
			console.log('data error');
		}
	});
};

// Проверка количества слайдов - вызов функции создания слайдов
//запрос новых слайдов при переходе к последнему текущему слайду
function checkAndLoadSlides() {
	if (swiper.slides.length < maxSlidesNum) {
		if (swiper.realIndex + 1 === swiper.slides.length) {
			offset = swiper.slides.length;
			fetchServer(slideUrl, offset, limit);
		}
	}
};

// анимация тайтла страницы при движении вправо
function moveTitlesNext() {

	let title = $('.slide__title_alt-current').eq(swiper.realIndex - 1);
	title.addClass('slide__title_hide-left');

	let otherTitles = $('.slide__title_alt-current')
		.not(title);
	otherTitles.addClass('slide__title_hidden');

	let nextTitle = $('.slide__title_alt-current').eq(swiper.realIndex);
	nextTitle.removeClass('slide__title_next slide__title_hidden');
};

// анимация тайтла страницы при движении влево
function moveTitlesPrev() {
	let prevTitle = $('.slide__title_alt-current').eq(swiper.realIndex);
	prevTitle.removeClass('slide__title_hide-left slide__title_hidden');

	let otherTitles = $('.slide__title_alt-current')
		.not(prevTitle);
	otherTitles.addClass('slide__title_hidden');

	let currentTitle = $('.slide__title_alt-current').eq(swiper.realIndex + 1);
	currentTitle.addClass('slide__title_next slide__title_hidden');
};

// добавление альтернативных заголовков  на уровень выше заголовков в слайдах для независимости анимаций слайд-заголовок
let i = 0;

function createAltTitles() {
	let template = document.querySelector('.page__title-template');
	let clone = template.content.cloneNode(true);

	let title = clone.querySelector('.slide__title-text');
	title.textContent = this.title;

	if (i === 0) {
		let wrapper = clone.querySelector('.slide__title');
		wrapper.classList.remove('slide__title_next');
		i++;
	}

	document.querySelector('.page__slide').appendChild(clone);
};

// меняем прозрачность стрелок навигации на первом и последнем слайде
function changeArrowsOpacity() {
	if (currentSlideIndex === 0) {
		arrowLeft.addClass('slide__arrow_weak');
	} else {
		arrowLeft.removeClass('slide__arrow_weak');
	}

	if (currentSlideIndex == maxSlidesNum - 1) {
		arrowRight.addClass('slide__arrow_weak');
	} else {
		arrowRight.removeClass('slide__arrow_weak');
	}
};

function moveRight() {
	let currentSlideRight = $('.slide__image-wrapper').eq(swiper.realIndex - 1);
	let nextSlideRight = $('.slide__image-wrapper').eq(swiper.realIndex);

	let nextLikeRight = $('.slide__like').eq(swiper.realIndex);
	let currentLikeRight = $('.slide__like').eq(swiper.realIndex - 1);

	let nextDescriptionRight = $('.slide__description-text').eq(swiper.realIndex);
	let currentDescriptionRight = $('.slide__description-text').eq(swiper.realIndex - 1);

	nextSlideRight.removeClass('right');
	currentSlideRight.addClass('left').removeClass('right');

	currentLikeRight.addClass('slide__like_hidden');
	currentDescriptionRight.addClass('slide__description-text_hidden');

	setTimeout(() => {
		nextDescriptionRight.removeClass('slide__description-text_hidden');
		nextLikeRight.removeClass('slide__like_hidden');
	}, 700);
}

function moveLeft() {
	let nextSlide = $('.slide__image-wrapper').eq(swiper.realIndex);
	let currentSlide = $('.slide__image-wrapper').eq(swiper.realIndex + 1);

	nextSlide.removeClass('left');
	currentSlide.addClass('right').removeClass('left');

	let nextLike = $('.slide__like').eq(swiper.realIndex);
	let currentLike = $('.slide__like').eq(swiper.realIndex + 1);

	let nextDescription = $('.slide__description-text').eq(swiper.realIndex);
	let currentDescription = $('.slide__description-text').eq(swiper.realIndex + 1);

	setTimeout(() => {
		nextLike.removeClass('slide__like_hidden');
	}, 700);
	currentLike.addClass('slide__like_hidden');

	currentDescription.addClass('slide__description-text_hidden');
	setTimeout(() => {
		nextDescription.removeClass('slide__description-text_hidden');
	}, 700);
}

// После загрузки DOM делаем запрос на первые 3 слайда, инициализируем свайпер
$(document).on('DOMContentLoaded', function () {

	fetchServer(slideUrl, 0, 3);

	swiper = new Swiper('.js-swiper', {
		// Optional parameters
		direction: 'horizontal',
		loop: false,
		slidesPerView: 1,
		slidesPerColumn: 1,
		observer: true,
		observeParents: true,
		allowTouchMove: false,

		//custom animation
		speed: 1200,
		effect: 'creative',
		// // limitProgress: 2,
		// creativeEffect: {
		// 	prev: {
		// 		translate: ['0', 0, 1],
		// 	},
		// 	next: {
		// 		translate: ['0', 0, 0],
		// 		// scale: 1,
		// 		// origin: 'left top'
		// 	},
		// },

		navigation: {
			nextEl: '.js-right',
			prevEl: '.js-left',
		},
		on: {
			slideChange: function (swiper) {
				currentSlideIndex = swiper.realIndex;
				changeArrowsOpacity();
			},
			// slideChangeTransitionEnd: function (swiper) {
			// 	console.log('ddfsdf');
			// },
			slideNextTransitionStart: function (swiper) {
				checkAndLoadSlides();
				scrollImagesToStartPos();
				moveTitlesNext();
				setLikeStateByCookie(swiper.realIndex);
				moveRight(swiper.realIndex);
				changeArrowsOpacity();
			},
			slidePrevTransitionStart: function (swiper) {
				moveTitlesPrev();
				moveLeft(swiper.realIndex);
				changeArrowsOpacity();
			},
		},
	});
});

function setLikeStateByCookie(id) {
	if ($.cookie(`user.like.${id}`)) {
		let like = $(`.like__button[data-id=${id}]`);
		like.addClass('like__button_active');

		let num = like.siblings('.like__counter').children('.like__text_orange')
		num.text(parseInt(num.text()) + 1);
	}
};

function setLikeCookie(id) {
	$.cookie(`user.like.${id}`, 'true', {
		expires: 50,
		path: '/'
	});
}


// Функция обрезки элемента, сравнение с высотой родителя. Если больше - добавление элементу класса с модификатором + вызов функции Показа подсказки
// function truncateElement(classname) {
// 	let element = $(`.${classname}`);
// 	console.log(element);
// 	if (element.hasClass(`${classname}_truncated`)) {
// 		console.log('elem already truncated');
// 		return
// 	}
// 	// console.log(element.height());
// 	// console.log(element.parent().height());
// 	if (element.height() > element.parent().height()) {
// 		element.addClass(`${classname}_truncated`)
// 		console.log('elem truncated');
// 		showTooltipIfTruncated(classname);
// 	}
// 

// Функция показа подсказки с полным текстом элемента
// function showTooltipIfTruncated(classname) {
// 	let element = $(`${classname}`);
// 	element
// 		.siblings('.tooltip')
// 		.attr('tooltip', element.text())
// 		.addClass(`tooltip_visible`);
// }
// truncateElement('.slide__description-text');
// $('.js-like__button').on('click', function () {
// 	console.log('like');
// 	$(this).addClass('like__button_active');
// })



// ajaxStart — Данный метод вызывается в случае когда побежал AJAX запрос, и при этом других запросов нету
// beforeSend — Срабатывает до отправки запроса, позволяет редактировать XMLHttpRequest. Локальное событие
// ajaxSend — Срабатывает до отправки запроса, аналогично beforeSend
// success — Срабатывает по возвращению ответа, когда нет ошибок ни сервера, ни вернувшихся данных. Локальное событие
// ajaxSuccess — Срабатывает по возвращению ответа, аналогично success
// error — Срабатывает в случае ошибки. Локальное событие
// ajaxError — Срабатывает в случае ошибки
// complete — Срабатывает по завершению текущего AJAX запроса (с ошибкои или без — срабатывает всегда).Локальное событие
// ajaxComplete — Глобальное событие, аналогичное complete
// ajaxStop — Данный метод вызывается в случае когда больше нету активных запросов