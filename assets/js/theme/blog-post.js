import PageManager from './page-manager';
import $ from 'jquery';


export default class BlogPost extends PageManager {
    onReady() {
        this.gallery_carousel();
    }

    gallery_carousel() {
        $('.imageGallery-carousel').slick({
            dots: true,
            arrows: false,
            infinite: false,
            mobileFirst: true,
            slidesToShow: 2,
            slidesToScroll: 2,
            responsive: [{
                breakpoint: 993,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    dots: false
                }
            }, {
                breakpoint: 551,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            }]
        });
    }
}
