import $ from 'jquery';
import 'jquery-zoom';
import _ from 'lodash';
import fancybox from '../themevale/jquery.fancybox.min';

export default class ImageGallery {
    constructor($gallery) {
        this.$mainImage = $gallery.find('[data-image-gallery-main]');
        this.$mainImage2 = $gallery.find('.slick-current [data-image-gallery-main]');
        this.$selectableImages = $gallery.find('[data-image-gallery-item]');
        this.$selectOption = $gallery.find('.slick-current [data-image-gallery-main]');
        this.$swipThumbnails = $gallery.find('.productView-for');
        this.currentImage = {};
    }

    init() {
        this.bindEvents();
        this.setImageZoom();
        this.fancyboxZoom();
    }

    setMainImage(imgObj) {
        this.currentImage = _.clone(imgObj);

        this.setActiveThumb();
        this.swapMainImage();
    }

    setAlternateImage(imgObj) {
        if (!this.savedImage) {
            this.savedImage = {
                mainImageUrl: this.$mainImage.find('img').attr('src'),
                zoomImageUrl: this.$mainImage.attr('data-zoom-image'),
                $selectedThumb: this.currentImage.$selectedThumb,
            };
        }
        this.setMainImage(imgObj);
    }

    restoreImage() {
        if (this.savedImage) {
            this.setMainImage(this.savedImage);
            delete this.savedImage;
        }
    }

    selectNewImage(e) {
        e.preventDefault();
        const $target = $(e.currentTarget);
        const imgObj = {
            mainImageUrl: $target.attr('data-image-gallery-new-image-url'),
            zoomImageUrl: $target.attr('data-image-gallery-zoom-image-url'),
            $selectedThumb: $target,
        };

        this.setMainImage(imgObj);
    }

    selectNewImage2(e) {
        const $target = $(e.currentTarget).find('.slick-current [data-image-gallery-item]');
        const imgObj = {
            mainImageUrl: $target.attr('data-image-gallery-new-image-url'),
            zoomImageUrl: $target.attr('data-image-gallery-zoom-image-url'),
            $selectedThumb: $(e.currentTarget).find('.slick-current'),
        };
        this.setMainImage(imgObj);
    }

    selectNewImage3(e) {
        e.preventDefault();
        const $target = $('.productView-for').find('.slick-current [data-image-gallery-item]');
        const imgObj = {
            mainImageUrl: $target.attr('data-image-gallery-new-image-url'),
            zoomImageUrl: $target.attr('data-image-gallery-zoom-image-url'),
            $selectedThumb: $target,
        };

        this.setMainImage(imgObj);
    }

    setActiveThumb() {
        this.$selectableImages.removeClass('is-active');
        if (this.currentImage.$selectedThumb) {
            this.currentImage.$selectedThumb.addClass('is-active');
        }
    }

    swapMainImage() {
        var $selectOption = $('.productView-nav').find('.slick-current [data-image-gallery-main]');
        this.$mainImage.attr({ 'data-zoom-image': this.currentImage.zoomImageUrl,})
            .find('a').attr({href: this.currentImage.mainImageUrl})
            .find('img').attr({src: this.currentImage.mainImageUrl});
         $selectOption.attr({'data-href': this.currentImage.zoomImageUrl});

        this.$mainImage.attr({ 'data-mfp-src': this.currentImage.zoomImageUrl,})
            .find('img').attr({ src: this.currentImage.mainImageUrl });

        this.$mainImage.find('img.zoomImg').attr({src: this.currentImage.zoomImageUrl});
    }

    checkImage() {
        const containerHeight = $('.productView-image').height();
        const containerWidth = $('.productView-image').width();
        const height = this.easyzoom.data('easyZoom').$zoom.context.height;
        const width = this.easyzoom.data('easyZoom').$zoom.context.width;
        if (height < containerHeight || width < containerWidth) {
            this.easyzoom.data('easyZoom').hide();
        }
    }

    setImageZoom() {
        if ($(window).width() > 1024) {
            if (!$('.themevale_productView-images.layout-4-item').length && !$('.themevale_productView-center-slider').length) {
                this.$mainImage.zoom({ url: this.$selectOption.attr('data-zoom-image'), touch: false });
            } else {
                this.$mainImage.zoom({ touch: false });
            }
        }
    }

    bindEvents() {
        this.$selectableImages.on('click', this.selectNewImage3.bind(this));
        this.$swipThumbnails.on('afterChange', this.selectNewImage2.bind(this));
    }

    fancyboxZoom() {
        $('[data-fancybox]').fancybox({
            buttons: [
                "zoom",
                //"share",
                "slideShow",
                //"fullScreen",
                //"download",
                // "thumbs",
                "close"
            ]
        });
    }
}
