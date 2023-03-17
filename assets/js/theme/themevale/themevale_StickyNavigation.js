import $ from 'jquery';

export default function() {
    function header_sticky() {
        // Add class fixed for menu when scroll
        var header_position, header_height = $('.header').height();
        setTimeout(function(){
        if ($(window).width() > 1024) {
            if ($('.menu-sticky').length) {
                    header_position = $('.menu-sticky').offset();
                header_scroll(header_position.top, header_position.top - $('#themevale_top-promotion').height());
            }
        }
        else {
            header_position = $('.themevale_header-Mobile').offset();
            header_scroll(header_position.top, header_height);
        }
        }, 1500);
    }
    header_sticky();


    function header_scroll(header_position, header_height) {
        $(window).on('scroll', function(event) {
            var scroll = $(window).scrollTop();
            if (scroll > header_position) {
                $('header').addClass('is-sticky');
                $('body').css('padding-top', header_height);
            }
            else {
                $('header').removeClass('is-sticky');
                $('body').css('padding-top', 0);
            }
        });
        
        window.onload = function() {
            if ($(window).scrollTop() > header_position) {
                $('header').addClass('is-sticky');
            }
        };
    }

}
