;(function () {
    function AutoSlide (el,options) {
        this.el = typeof el == 'string' ? document.querySelector(el) : el;

        this.options = {
            touchArea : window,
            direction : 'top'
        }

        for (var key in options) {
            this.options[key] = options[key];
        }

        this.init();
        this.addEvent();
    };

    AutoSlide.prototype = {
        handleEvent : function (e) {
            switch (e.type) {
                case 'touchstart' :
                    this._start(e);break;
                case 'touchmove' :
                    this._move(e); break;
                case 'touchend' :
                    this._end(e) ; break;
                case 'transitionEnd':
                case 'webkitTransitionEnd':
                    this.transitionEnd(e);
            }
        },
        init : function () {
            this.parentEl = this.el.parentNode;
            this.isClose = false;
            this.isMove = false;
            this.isScrollTop = false;
            this.wrap();
            var style = {
                transition : 'transform ' + '300ms ' + '',
                overflow : 'hidden'
            }
            for (var key in style) {
                this.autoSliderWrap.style[key] = style[key];
            }

            switch (this.options.direction) {
                case 'top' : this.backDirection = 'bottom';break;
                case 'bottom' : this.backDirection = 'top';break;
            }

            var dir = (this.options.direction=='top') ? -1 : 1;
            this.sliderHeight = this.el.offsetHeight * dir;
        },
        wrap : function () {
            var parentElWidth = this.parentEl.offsetWidth,
                parentElHeight = this.parentEl.offsetHeight,
                elHeight = this.el.offsetHeight,
                elWidth = this.el.offsetWidth;
            var wrap = document.createElement('div'),
                top = document.createElement('div'),
                bottom = document.createElement('div');
            wrap.className = 'auto-Slide-wrap';
            top.className = 'auto-Slide-top';
            bottom.className = 'auto-Slide-bottom';


            wrap.style.width = parentElWidth + 'px';
            wrap.style.height = parentElHeight + 'px';
            wrap.style.overflow = 'hidden';

            this.options.touchArea = wrap;

            this.el.style.width = elWidth + 'px' ;
            this.el.style.height = elHeight + 'px';
            top.appendChild(this.el);

            bottom.style.height = parentElHeight + 'px' ;
            bottom.style.width = parentElWidth + 'px' ;
            bottom.style.overflow = 'hidden';
            this.bottomScrollHeight = bottom.scrollHeight;
            this.bottomHeight = parentElHeight;

            var child = this.parentEl.firstChild;
            while (child) {
                bottom.appendChild(child);
                child = this.parentEl.firstChild;
            }
            wrap.style.height =  elHeight + parentElHeight + 'px';
            wrap.appendChild(top);
            wrap.appendChild(bottom);
            this.parentEl.appendChild(wrap);


            this.autoSliderWrap = wrap;
            this.autoSliderTop = top;
            this.autoSliderBottom = bottom;
        },
        addEvent : function () {
            this.options.touchArea.addEventListener('touchstart',this,false)
            this.options.touchArea.addEventListener('touchmove',this,false)
            this.options.touchArea.addEventListener('touchend',this,false)
            this.parentEl.addEventListener('transitionEnd',this,false)
            this.parentEl.addEventListener('webkitTransitionEnd',this,false)
            this.autoSliderBottom.addEventListener('scroll',this.bottomScroll.bind(this),false)
        },
        removeEvent : function () {
            this.options.touchArea.removeEventListener('touchstart',this,false)
            this.options.touchArea.removeEventListener('touchmove',this,false)
            this.options.touchArea.removeEventListener('touchend',this,false)
            this.parentEl.removeEventListener('transitionEnd',this,false)
            this.parentEl.removeEventListener('webkitTransitionEnd',this,false)
            this.autoSliderBottom.removeEventListener('scroll',this.bottomScroll.bind(this),false)
        },
        transitionEnd : function () {
            this.isClose = !this.isClose;
            this.isMove = false;
        },
        _start : function (e) {
            var touch = e.touches[0];
            this.startX = touch.pageX;
            this.startY = touch.pageY;
        },
        _move : function (e) {
            if(this.isMove){
                return;
            }

            var touch = e.touches[0];
            var moveX = touch.pageX-this.startX,
                moveY = touch.pageY-this.startY,
                touchAngle = Math.atan2(Math.abs(touch.pageY - this.startY), Math.abs(touch.pageX - this.startX)) * 180 / Math.PI;
                moveDirectionY = moveY >0 ? 'bottom' : 'top';
            this.moveDirectionY = moveDirectionY;

            //if ((this.isScrollTop && moveDirectionY == 'bottom')){
            //    this.scrollDisable();
            //}else{
            //    this.scrollEnable();
            //}
            if(this.isBack()) {
                this.back();
                return
            }
            if(touchAngle >= 45 && this.options.direction == moveDirectionY){
                this.go(0,this.sliderHeight);
            }
        },
        _end : function (e) {

        },
        go : function (x,y) {
            if(this.isClose)return;
            this.autoSliderBottom.style.overflow = 'auto';
            this.translate(x,y);
            //this.scrollDisable();
        },
        isBack : function () {
            return this.isClose && this.autoSliderBottom.scrollTop == 0 && this.backDirection == this.moveDirectionY
        },
        back : function () {
            this.autoSliderBottom.style.overflow = 'hidden';
            this.translate(0,0);
        },
        translate :function (x,y) {
            this.isMove = true;
            this.autoSliderWrap.style.transform = 'translate('+ x + 'px,' + y + 'px)';
        },
        bottomScroll : function () {
            var scrollTop = this.autoSliderBottom.scrollTop;
            this.isScrollTop = scrollTop <=5;

        },
        scrollDisable : function () {
            document.body.addEventListener('touchmove',this.preventDefault,false);
        },
        scrollEnable : function () {
            document.body.removeEventListener('touchmove',this.preventDefault,false);
        },
        preventDefault : function (e) {
            e.preventDefault();
            e.stopPropagation();
        }

    }

    window.AutoSlide = AutoSlide
})()