document.addEventListener('DOMContentLoaded', () => {
    'use strict'

    class Photogilter {
        constructor(optionsPgotofilter) {
            this.initialState = {
                'blur_value': 0,
                'invert_value': 0,
                'sepia_value': 0,
                'saturate_value': 100,
                'hue_value': 0,
            };

            // main blocks
            this.inputsParent = document.querySelector(optionsPgotofilter.inputsBlock || '.controls__block');
            this.photosblock = document.querySelector(optionsPgotofilter.photosBlock || '.photos__block');
            this.fullScreenBtn = document.getElementById('full__screen');

            // aditionals variables
            this.btnsParent = this.photosblock.querySelector('.photos__btns');
            this.fileInput = this.btnsParent.querySelector('input[type="file"]');
            this.photosParent = this.photosblock.querySelector('.photos__list');
            this.file = '';


            // binding methods
            this.init = this.init.bind(this);

            this._listenerChangeInputs = this._listenerChangeInputs.bind(this);
            this._listenerClickBtns = this._listenerClickBtns.bind(this);
            this._listenerFullScreenBtn = this._listenerFullScreenBtn.bind(this);
            this._listenerFileLoad = this._listenerFileLoad.bind(this);

            this._changeOutPutNumberAndFilterVar = this._changeOutPutNumberAndFilterVar.bind(this);
            this._clearFilter = this._clearFilter.bind(this);

            this._loadImg = this._loadImg.bind(this);
            this._changeActivePhoto = this._changeActivePhoto.bind(this);
            this._saveImg = this._saveImg.bind(this);
            this._initCanvas = this._initCanvas.bind(this);
            this._fullscreenChange = this._fullscreenChange.bind(this);
            this._fullscreenEnter = this._fullscreenEnter.bind(this);
            this._fullscreenExit = this._fullscreenExit.bind(this);
            this._exitFullscreen = this._exitFullscreen.bind(this);
        }

        // init app
        init() {
            this.inputsParent.querySelectorAll('input[type="range"]').forEach(inputEl => {
                this._changeOutPutNumberAndFilterVar(inputEl);
            });

            this._listenerChangeInputs();
            this._listenerClickBtns();
            this._listenerFullScreenBtn();
            this._listenerFileLoad();
            this._initCanvas();
        }

        // listener for inputs type=range
        _listenerChangeInputs() {
            this.inputsParent.addEventListener('input', (e) => {
                if (e.target.matches('input[type="range"]')) {
                    this._changeOutPutNumberAndFilterVar(e.target);
                }
            });
        }

        // listener for btns over photo
        _listenerClickBtns() {
            this.btnsParent.addEventListener('click', (e) => {
                let target = e.target;
                if (target.matches('.one__btn')) {

                    if (target.dataset.trigger == 'reset') {
                        this._clearFilter();
                    }
                    if (target.dataset.trigger == 'next') {
                        this._changeActivePhoto('next');
                    }
                    if (target.dataset.trigger == 'load') {
                        this.fileInput.click();
                    }
                    if (target.dataset.trigger == 'save') {
                        this._saveImg();
                    }
                }
            });
        }

        // listener for btn full screen
        _listenerFullScreenBtn() {
            this.fullScreenBtn.addEventListener('click', this._fullscreenChange);

            document.addEventListener('webkitfullscreenchange', this._exitFullscreen);
            document.addEventListener('mozfullscreenchange', this._exitFullscreen);
            document.addEventListener('MSFullscreenChange', this._exitFullscreen);
            document.addEventListener('fullscreenchange', this._exitFullscreen);
        }

        // listener for input type=file
        _listenerFileLoad() {
            this.fileInput.addEventListener('change', (e) => this._loadImg(e));
        }

        // change viev on change input
        _changeOutPutNumberAndFilterVar(inputEl) {
            let inputOutputNumber = inputEl.parentElement.nextElementSibling;
            let currentValue = inputEl.value
            let valueWidth = +Math.floor(currentValue / inputEl.max * 100);

            inputOutputNumber.value = currentValue;
            inputEl.style.background = `linear-gradient(to right, #1a7749 0%, #1a7749 ${valueWidth}%, #b9cbdd ${valueWidth}%, #b9cbdd 100%)`;
            document.body.style.setProperty('--' + inputEl.name, currentValue + inputEl.dataset.var);
        }

        // clear custom filter options
        _clearFilter() {
            this.inputsParent.querySelectorAll('input[type="range"]').forEach(inputEl => {
                inputEl.value = this.initialState[inputEl.name];
                this._changeOutPutNumberAndFilterVar(inputEl);
            });
        }

        // load custom img
        _loadImg(e) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                this.file = reader.result;
                const img = new Image();
                const wrapImg = document.createElement('li');

                img.src = this.file;
                wrapImg.classList.add('photo__item');
                wrapImg.append(img);
                this.photosParent.append(wrapImg);
                this._changeActivePhoto('last')
            }

            reader.readAsDataURL(file);
        }

         // change active photo for view
        _changeActivePhoto(number='next') {
            let photos = this.photosParent.querySelectorAll('.photo__item');
            let aciveIndex = 0;

            photos.forEach((el, ind) => {
                if (el.classList.contains('active__photo')) {
                    aciveIndex = ind + 1;
                }
                el.classList.remove('active__photo');
            });

            if (aciveIndex >= photos.length ) aciveIndex = 0;

            if (number === 'next') photos[aciveIndex].classList.add('active__photo');
            else if (number === 'last') photos[photos.length - 1].classList.add('active__photo');
        }

        // save photo with filter options
        _saveImg() {
            const canvas = document.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            const activePhoto = this.photosParent.querySelector('.active__photo img');
            const optionsFilterForPhoto = window.getComputedStyle(activePhoto).getPropertyValue('filter');

            img.setAttribute('crossOrigin', 'anonymous');
            img.src = activePhoto.getAttribute('src');

            img.onload = function () {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.filter = optionsFilterForPhoto;
                ctx.drawImage(img, 0, 0);

                // save
                const linkImg = document.createElement('a');
                linkImg.classList.add('img__link');
                linkImg.style.display = 'none';
                linkImg.href = canvas.toDataURL();
                linkImg.download = 'download.png';

                linkImg.click();
                linkImg.delete;
            };
        }

        // add canvas in document body
        _initCanvas() {
            const canvas = document.createElement('canvas');
            canvas.style.display = 'none';
            document.body.append(canvas);
        }

        // change fullscreen page
        _fullscreenChange() {
            const fullscreenElement = document.fullscreenElement
                || document.mozFullscreenElement
                || document.webkitFullscreenElement;

            fullscreenElement === null
                ? this._fullscreenEnter()
                : this._fullscreenExit();
        }

        // for esc btn
        _exitFullscreen() {
            if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.mozFullscreenElement) {
                this._fullscreenExit();
            }
        }

        // enter in fullscreen
        _fullscreenEnter() {
            if (document.body.requestFullScreen) document.body.requestFullScreen();
            else if (document.body.mozRequestFullScreen) document.body.mozRequestFullScreen();
            else if (document.body.webkitRequestFullScreen) document.body.webkitRequestFullScreen();

            this.fullScreenBtn.classList.add('active__rull__screen');
        }

        // exit from fullscreen
        _fullscreenExit() {
            if (document.cancelFullScreen) document.cancelFullScreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();

            this.fullScreenBtn.classList.remove('active__rull__screen');
        }
    }


    const photofilter = new Photogilter({
        inputsBlock: '.controls__block',
        photosBlock: '.photos__block',
    });

    photofilter.init();
})