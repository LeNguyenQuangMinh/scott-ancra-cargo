import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import swal from 'sweetalert2';
import _ from 'lodash';

export default function(){
    var scroll = $('#form-action-addToCart').offset();
    var h_statc = $('#sticky_addtocart').outerHeight();

    $(window).scroll(function(){
        if($(window).scrollTop() > scroll.top + 100){
            if(!$('#sticky_addtocart').hasClass('show_sticky')){
                $('#sticky_addtocart').addClass('show_sticky');
                if ($(window).width() > 767) {
                    $('.themevale_popup_left').css("bottom", $('#sticky_addtocart').outerHeight() + 15);
                    $('.themevale_popup_left.position-right #recently_bought_list').css("bottom", $('#sticky_addtocart').outerHeight() + 15);
                } else {
                    $('.themevale_popup_left').css("bottom", $('#sticky_addtocart').outerHeight());
                    $('.themevale_popup_left.position-right #recently_bought_list').css("bottom", $('#sticky_addtocart').outerHeight());
                }
                $('footer.footer').css('padding-bottom', h_statc);
            }
        } else{
            $('#sticky_addtocart').removeClass('show_sticky');
            $('.pop-up-option').removeClass('is-open');
            $('.choose_options_add').removeClass('is-active');
            if ($(window).width() > 767) {
                $('.themevale_popup_left').css("bottom", 15);
                $('.themevale_popup_left.position-right #recently_bought_list').css("bottom", 15);
            } else {
                $('.themevale_popup_left').css("bottom", 0);
                $('.themevale_popup_left.position-right #recently_bought_list').css("bottom", 0);
            }
            $('footer.footer').css('padding-bottom', 0);
        }
    });

    $(document).on('click','.choose_options_add', function(event){
        $(this).toggleClass('is-active');
        $('.pop-up-option').toggleClass('is-open');
    });

    $(document).on('click','.pop-up-option .close', function(event){
        $(".pop-up-option").removeClass('is-open');
        $('.choose_options_add').removeClass('is-active');
    });

    window.onload = function(){
        if($(window).scrollTop() > scroll.top - 160){
            if(!$('#sticky_addtocart').hasClass('show_sticky')){
                $('#sticky_addtocart').addClass('show_sticky');
                if ($(window).width() > 767) {
                    $('.themevale_popup_left').css("bottom", $('#sticky_addtocart').outerHeight() + 15);
                    $('.themevale_popup_left.position-right #recently_bought_list').css("bottom", $('#sticky_addtocart').outerHeight() + 15);
                } else {
                    $('.themevale_popup_left').css("bottom", $('#sticky_addtocart').outerHeight());
                    $('.themevale_popup_left.position-right #recently_bought_list').css("bottom", $('#sticky_addtocart').outerHeight());
                }
                $('footer.footer').css('padding-bottom', h_statc);
            }
        }
    }
}
