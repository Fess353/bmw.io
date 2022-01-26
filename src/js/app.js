'use strict';

import {
	enableBodyScroll,
	disableBodyScroll
} from '@funboxteam/diamonds';

// if (document.body.webkitRequestFullScreen) {
// 	window.addEventListener('click', function(e) {
// 	  if (e.target.type != 'text' && e.target.type != 'password') {
// 		body.webkitRequestFullScreen();
// 		window.setTimeout(function() {
// 		  document.webkitCancelFullScreen();
// 		}, 500);
// 	  }
// 	}, false);
//   }

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
	// console.log('img to svg');
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
// $('body').on('DOMNodeInserted', imgToSvg);
imgToSvg();

//Объявление основных переменных
let currentSlideIndex = 0;
let popup = $('.js-page__popup');
let popupBody = $('.js-popup__body');
let popupTitle = $('.js-popup__title');
let popupThanks = $('.js-popup__thanks');
let popupDesc = $('.js-popup__description');

let arrows = $('.js-right, .js-left');
let arrowRight = $('.js-right');
let arrowLeft = $('.js-left');

let maxSlidesNum;
let offset = 0;
let limit = 3;
let slideUrl = 'https://private-anon-449a84c19b-grchhtml.apiary-mock.com/slides';
let swiper;

// Делаем ajax запрос на сервер
// При успехе - формируем слайды и альтернативные заголовки на уровень выше, единоразово запускаем стартовые функции
let j = 0;
async function fetchServer(urlAdress, offsetNumber, limitNumber) {
	let urlElement = '';
	if (offsetNumber !== undefined && limitNumber !== undefined) {
		urlElement = `?offset=${offsetNumber}&limit=${limitNumber}`;
	}

	let url = urlAdress + urlElement;
	// console.log('url ' + url);

	$.ajax({
		url: url,
		method: 'get',
		dataType: 'json',
		success: function (data) {
			// console.log(data.data);
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

// Создание нового слайда по Темплейту. Создаем клон, формируем элементы по информации из объекта, добавляем ID на кнопку лайка, передаем клон в свайпер, обновляем свайпер
let k = 0;
function createSlideByTemplate() {
	let template = document.querySelector('.js-page__template');
	let clone = template.content.cloneNode(true);

	let title = clone.querySelector('.js-slide__title');
	title.textContent = this.title;

	let description = clone.querySelector('.js-slide__description-text');
	description.textContent = this.desc;

	let image = clone.querySelector('.js-slide__image');
	image.src = this.imgUrl;

	let likeCounter = clone.querySelector('.js-like__text_orange');
	likeCounter.textContent = this.likeCnt;

	let like = clone.querySelector('.js-like__button');
	like.setAttribute('data-id', this.id);

	if (k === 0) {
		let imgWrapper = clone.querySelector('.js-slide__image-wrapper');
		imgWrapper.classList.remove('right');
		imgWrapper.classList.add('center-sm')

		let like = clone.querySelector('.js-slide__like');
		like.classList.remove('slide__like_hidden');

		description.classList.remove('slide__description-text_hidden');
		k++;
	};
	swiper.appendSlide(clone);
	swiper.update();
};

// Набор функций после запуска
function startFunctions() {
	changeArrowsOpacity();
	setLikeStateByCookie(currentSlideIndex);
	imgToSvg();
	scrollImagesToStartPos();
	setTimeout(() => {
		scrollImagesToStartPos();
	}, 200);
	window.scrollTo(0,1);
};

// После загрузки DOM делаем запрос на первые 3 слайда, инициализируем свайпер
$(document).on('DOMContentLoaded', function () {

	fetchServer(slideUrl, 0, 3);

	swiper = new Swiper('.js-page__slide', {
		direction: 'horizontal',
		loop: false,
		slidesPerView: 1,
		slidesPerColumn: 1,
		observer: true,
		observeParents: true,
		allowTouchMove: false,
		speed: 1200,
		effect: 'creative',
		navigation: {
			nextEl: '.js-right',
			prevEl: '.js-left',
		},
		on: {
			slideChange: function (swiper) {
				currentSlideIndex = swiper.realIndex;
				changeArrowsOpacity();
			},
			slideNextTransitionStart: function (swiper) {
				checkAndLoadSlides();
				scrollImagesToStartPos();
				moveTitlesNext();
				setLikeStateByCookie(swiper.realIndex);
				moveRight(swiper.realIndex);
				changeArrowsOpacity();
				imgToSvg();
			},
			slidePrevTransitionStart: function (swiper) {
				moveTitlesPrev();
				moveLeft(swiper.realIndex);
				changeArrowsOpacity();
			},
		},
	});
});

// Проверка состояния лайка из куки перед загрузкой слайда
function setLikeStateByCookie(id) {
	if ($.cookie(`user.like.${id}`)) {
		let like = $(`.js-like__button[data-id=${id}]`);
		like.addClass('like__button_active');

		let num = like.siblings('.like__counter').children('.like__text_orange')
		num.text(parseInt(num.text()) + 1);
	}
};

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

// Изменения состояния кнопки Лайк на активное, добавление +1 к каунтеру с таймаутом под анимацию для незаметности изменения числа
function changeLikeState() {
	let like = $(`.js-like__button[data-id=${currentSlideIndex}]`);
	like.addClass('like__button_active');

	let counter = like.siblings('.like__counter');
	let num = counter.children('.like__text_orange')

	setTimeout(() => {
		num.text(parseInt(num.text()) + 1);
	}, 300);
};

// Сохранение куки по ID слайда	
function setLikeCookie(id) {
	$.cookie(`user.like.${id}`, 'true', {
		expires: 50,
		path: '/'
	});
};

// Промотать изображение на слайде по горизонтали для фокуса на машине
function scrollImagesToStartPos() {
	let image = $('.js-slide__image').eq(currentSlideIndex);
	let slideOffsetScroll = image.width() * 0.166;
	image.parent().scrollLeft(slideOffsetScroll)
};


// Показать Попап
function showPopup() {
	popup.removeClass('page__popup_hidden');
	popupBody.removeClass('popup__body_hidden');
	disableBodyScroll();
};

// Спрятать Попап
function hidePopup() {
	popup.addClass('page__popup_hidden');
	popupBody.addClass('popup__body_hidden');
	enableBodyScroll();
};

// Изменение текста в Попапе при успешном запросе
function changePopupToSuccess(data) {
	popupTitle.text(data.title);
	popupThanks.text(data.desc);
	popupDesc.text($('.slide__description', swiper.slides[swiper.realIndex]).eq(0).text());
};

// Изменение текста в Попапе при ошибке в запросе
function changePopupToFail() {
	popupTitle.text('Ошибка запроса');
	popupThanks.text('Простите. Не удалось поставить "лайк", но Вы можете попробовать еще раз ^_^. Почитайте пока про BMW!');
	popupDesc.text($('.slide__description', swiper.slides[swiper.realIndex]).eq(0).text());
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

	// Слушатель на кнопку закрыть и черный фон - вызов закрытия попапа
	$(document).on('click', ('.js-popup__close-button, .js-popup__blackscreen'), function () {
		hidePopup();
	});

	// Слушатель на кнопки смены слайдов. Дизейбл кнопок на таймаут после смены слайда
	$(document).on('click', ('.js-right, .js-left'), function () {
		arrows.attr('disabled', true);
		if($(document).innerWidth() < 1920) {
			setTimeout(() => {
				arrows.attr('disabled', false);
			}, 600);
		} else {
			setTimeout(() => {
				arrows.attr('disabled', false);
			}, 1100);
		}
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
	truncateElement('.slide__title-text');
});

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
	let title = $('.js-slide__title_alt-current').eq(swiper.realIndex - 1);
	let otherTitles = $('.js-slide__title_alt-current').not(title);
	let nextTitle = $('.slide__title_alt-current').eq(swiper.realIndex);

	title.addClass('slide__title_hide-left');
	otherTitles.addClass('slide__title_hidden');
	nextTitle.removeClass('slide__title_next slide__title_hidden');
};

// анимация тайтла страницы при движении влево
function moveTitlesPrev() {
	let prevTitle = $('.js-slide__title_alt-current').eq(swiper.realIndex);
	let otherTitles = $('.js-slide__title_alt-current').not(prevTitle);
	let currentTitle = $('.js-slide__title_alt-current').eq(swiper.realIndex + 1);

	prevTitle.removeClass('slide__title_hide-left slide__title_hidden');
	otherTitles.addClass('slide__title_hidden');
	currentTitle.addClass('slide__title_next slide__title_hidden');
};

// добавление альтернативных заголовков  на уровень выше заголовков в слайдах для независимости анимаций слайд-заголовок
let i = 0;
function createAltTitles() {
	let template = document.querySelector('.js-page__title-template');
	let clone = template.content.cloneNode(true);

	let title = clone.querySelector('.js-slide__title-text');
	title.textContent = this.title;

	if (i === 0) {
		let wrapper = clone.querySelector('.js-slide__title_alt-current');
		wrapper.classList.remove('slide__title_next');
		i++;
	}

	document.querySelector('.js-page__slide').appendChild(clone);
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

// Смена прозрачности элементов и анимаций при движении слайдов вправо
function moveRight() {
	let currentSlide = $('.js-slide__image-wrapper').eq(swiper.realIndex - 1);
	let nextSlide = $('.js-slide__image-wrapper').eq(swiper.realIndex);
	let currentImg = $('.js-slide__image').eq(swiper.realIndex - 1);
	let currentLikeRight = $('.js-slide__like').eq(swiper.realIndex - 1);
	let nextLikeRight = $('.js-slide__like').eq(swiper.realIndex);	
	let currentDescriptionRight = $('.js-slide__description-text').eq(swiper.realIndex - 1);
	let nextDescriptionRight = $('.js-slide__description-text').eq(swiper.realIndex);

	currentSlide.addClass('left').removeClass('right');
	nextSlide.removeClass('right');
	currentImg.addClass('left-sm-img');
	nextSlide.addClass('center-sm');
	currentSlide.addClass('left-sm').removeClass('center-sm right-sm');
	currentLikeRight.addClass('slide__like_hidden');
	currentDescriptionRight.addClass('slide__description-text_hidden');
	setTimeout(() => {
		nextDescriptionRight.removeClass('slide__description-text_hidden');
		nextLikeRight.removeClass('slide__like_hidden');
	}, 700);
};

// Смена прозрачности элементов и анимаций при движении слайдов влево
function moveLeft() {
	let nextSlide = $('.js-slide__image-wrapper').eq(swiper.realIndex);
	let currentSlide = $('.js-slide__image-wrapper').eq(swiper.realIndex + 1);
	let nextImg = $('.js-slide__image').eq(swiper.realIndex);
	let nextLike = $('.js-slide__like').eq(swiper.realIndex);
	let currentLike = $('.js-slide__like').eq(swiper.realIndex + 1);
	let nextDescription = $('.js-slide__description-text').eq(swiper.realIndex);
	let currentDescription = $('.js-slide__description-text').eq(swiper.realIndex + 1);

	nextSlide.addClass('center-sm right-sm');
	currentSlide.addClass('right-sm').removeClass('center-sm');
	nextImg.removeClass('left-sm-img');
	nextSlide.removeClass('left');
	currentSlide.addClass('right').removeClass('left');
	currentSlide.addClass('right-sm');
	nextSlide.removeClass('left-sm');
	setTimeout(() => {
		nextLike.removeClass('slide__like_hidden');
	}, 700);
	currentLike.addClass('slide__like_hidden');

	currentDescription.addClass('slide__description-text_hidden');
	setTimeout(() => {
		nextDescription.removeClass('slide__description-text_hidden');
	}, 700);
};

// Функция при share Вконтакте, передает в url описание, изображение и название текущей страницы пользователя
$('.js-social__item_vk').on('click', function (e) {
	e.preventDefault();
	let shareUrl = window.location.href;
	let shareTitle = $('.slide__title').eq(currentSlideIndex).text();
	let shareDesc = $('.slide__description-text').eq(currentSlideIndex).text();
	let shareImage = $('.slide__image').eq(currentSlideIndex).attr('src');

	let vkUrl = `http://vk.com/share.php?url=${shareUrl}&title=${"Смотри какая! " + shareTitle + '. Нравится? Смотри еще по ссылке!'}&description=${shareDesc}&image=${shareImage}&noparse=true`;
	$(this).attr('href', vkUrl);
	window.open(vkUrl, '_blank');
})

// Функция при share в Одноклассники, передает в url описание, изображение и название текущей страницы пользователя
$('.js-social__item_ok').on('click', function (e) {
	e.preventDefault();
	let shareImage = $('.slide__image').eq(currentSlideIndex).attr('src');
	let shareUrl = window.location.href;
	let shareTitle = $('.slide__title').eq(currentSlideIndex).text();
	// $('meta[property=og\\:image]').attr('content', `${shareImage}`)

	let okUrl = `https://connect.ok.ru/offer?url=${shareUrl}&title=${'Смотри какая ' + shareTitle + '. Нравится? Смотри еще по ссылке!'}&imageUrl=${shareImage}`;
	$(this).attr('href', okUrl);
	window.open(okUrl, '_blank');
});

// Функция при share в Facebook, передает в url изображение текущей страницы пользователя
$('.js-social__item_fb').on('click', function (e) {
	e.preventDefault();
	let shareImage = $('.slide__image').eq(currentSlideIndex).attr('src');
	let shareUrl = window.location.href;

	$('meta[property=og\\:image]').attr('content', `${shareImage}`);
	$('meta[property=og\\:url]').attr('content', `${shareUrl}`);

	let fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&picture=${shareImage}`;

	$(this).attr('href', fbUrl);
	window.open(fbUrl, '_blank');
});