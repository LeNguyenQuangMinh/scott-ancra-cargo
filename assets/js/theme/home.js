import $ from 'jquery';
import PageManager from './page-manager';
import utils from '@bigcommerce/stencil-utils';
import parallax from './themevale/parallax/jquery.parallax-scroll.min';
import themevale_AddOption from './themevale/themevale_AddOptionForProduct';

export default class Home extends PageManager {
    onReady() {
        this.productsShowMore();
        this.homepage_countdown();
        this.homepage_countdown2();
        this.homepage_bannerBg();
        this.homepage_collectionsParallax();
        if ($('.themevale_productsByCategoryId-carousel').length) {
            this.homeProductsByCategory();
        }

        if ($('.themevale_productsByCategoryId-list').length) {
            this.homeProductsByCategory2();
        }

        if ($('.themevale_product-tabs').length) {
            this.homeProductsByCategoryTabs();
        }

        if ($('.themevale_productsByCategorySortTabs').length) {
            this.homeProductsByCategorySortingTabs();
        }
        
        if ($('.card-variant').length) {
            $('.card-variant').each((index, element) => {
                var $prodWrapId = $(element).attr('id');
                if ($prodWrapId != '') {
                    themevale_AddOption(this.context, $prodWrapId);
                }
            });
        }
        
        this.slickMarketingBanner();
    }

    productsShowMore(context) {
        var productsToShow = Number($('[data-number-product]').attr('data-number-product'));

        if ($('[data-event="show more"]').length) {
            if ($(window).width() > 551) {
                if ($('[data-event="show more"] .productGrid .product').length > productsToShow) {
                    $('[data-event="show more"] .productGrid .product').css({ 'display': 'inline-block' });
                    for(var i = productsToShow + 1, len = $('[data-event="show more"] .productGrid .product').length; i <= len; i++) {
                        $('[data-event="show more"] .productGrid .product:nth-child('+i+')').css({ 'display': 'none' });
                    }
                    if (!$('[data-event="show more"] .container .themevale_showMoreProduct').length) {
                        $('[data-event="show more"] .container').append('<div class="themevale_showMoreProduct"><a class="button big-button button--border" href="javascript:void(0);">Show More</a></div>');
                    }
                }
            } else {
                productsToShow = 4;
                if ($('[data-event="show more"] .productGrid .product').length > productsToShow) {
                    $('[data-event="show more"] .productGrid .product').css({ 'display': 'inline-block' });
                    $('[data-event="show more"] .productGrid .product:nth-child(n + 7)').css({ 'display': 'none' });
                    if (!$('[data-event="show more"] .container .themevale_showMoreProduct').length) {
                        $('[data-event="show more"] .container').append('<div class="themevale_showMoreProduct"><a class="button big-button button--border" href="javascript:void(0);">Show More</a></div>');
                    }
                }
            }

            $('.themevale_showMoreProduct a').on('click', function(e) {
                e.preventDefault();
                var listProducts = $(this).parents('[data-event="show more"]');
                listProducts.find('.productGrid .product:hidden:lt(' + productsToShow + ')').show();
                if (listProducts.find('.productGrid .product:hidden').length === 0) {
                    $(this).parent().css({ 'display': 'none' });
                }
            });
        }
    }

    homepage_countdown() {
        if ($('#count-down').length) {
            // Set the date we're counting down to        
            var countDownDate = new Date( $('#count-down').attr('data-count-down')).getTime();
            // Update the count down every 1 second
            var countdownfunction = setInterval(function() {

                // Get todays date and time
                var now = new Date().getTime();
        
                // Find the distance between now an the count down date
                var distance = countDownDate - now;
        
                // If the count down is over, write some text 
                if (distance < 0) {
                    clearInterval(countdownfunction);
                    document.getElementById("time").innerHTML = "";
                } else {
                    // Time calculations for days, hours, minutes and seconds
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
                    // Output the result in an element with id="countDowntimer"
                    var strCountDown = "<span class='block-time'>"+ days + "<span class='block-label'>days</span></span><span class='block-time'>"+ hours + "<span class='block-label'>hours</span></span><span class='block-time'>" + minutes + "<span class='block-label'>mins</span></span><span class='block-time'>" + seconds + "<span class='block-label'>secs</span></span>";
                    document.getElementById("time").innerHTML = strCountDown
                }
            }, 1000);
        }
    }

    homepage_countdown2() {
        if ($('.countDowntimer').length) {
            // Set the date we're counting down to        
            var countDownDate = new Date( document.getElementById("number").innerHTML ).getTime();
            // Update the count down every 1 second
            var countdownfunction = setInterval(function() {

                // Get todays date and time
                var now = new Date().getTime();
        
                // Find the distance between now an the count down date
                var distance = countDownDate - now;
        
                // Time calculations for days, hours, minutes and seconds
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
                // Output the result in an element with id="countDowntimer"
                document.getElementById("number").innerHTML = days + "d " + hours + ":" + minutes + ":" + seconds;
                
                // If the count down is over, write some text 
                if (distance < 0) {
                    clearInterval(countdownfunction);
                    document.getElementById("number").innerHTML = "EXPIRED";
                }
            }, 1000);
        }
    }

    homepage_bannerBg() {
        if ($('.themevale_product_hasbanner').length) {
            $('.themevale_product_hasbanner').each(function() {
                var image = ('url(' + $(this).find(".banner-section [data-src]").data("src") + ')');
                $(this).find('.banner-section').css('background-image', image);
            })
        }
    }

    homepage_collectionsParallax() {
        if ($('.banner-parallax-2').length) {
                $('.banner-parallax-2').each(function() {
                var image = ('url(' + $(this).find(".banner-parallax").data("src") + ')');
                $(this).find('.image-parallax-wrapper').css('background-image', image);
            });
        }
    }

    // ========================================================================
    // Ajax load products in a category tabs
    // ========================================================================

    // Load products in a Category: block Flash Deals Homepage 15
    homeProductsByCategory() {
        var $catUrlData ='themevale-products-by-category-id';
        const $options = {
            template: 'themevale/homepage/component/ajax-products-by-category-id-result'
        };       

        $('.themevale_productsByCategoryId-carousel [data-themevale-products-by-category-id]').each((i, productBlock) => {
           var blockId = $(productBlock).attr('id');
           this.loadProduct($(productBlock), $options, $catUrlData, blockId);
        });
    }

    //Load products in a Category: bock You May Also Like on Homepage 15
    homeProductsByCategory2() {
        var $catUrlData ='themevale-products-by-category-id';
        const $options = {
            template: 'themevale/homepage/component/ajax-products-by-category-id-result2'
        }; 

        $('.themevale_productsByCategoryId-list [data-themevale-products-by-category-id]').each((i, productBlock) => {
            var blockId = $(productBlock).attr('id');
            this.loadProduct($(productBlock), $options, $catUrlData, blockId);
        });
    }

    loadProduct($productBlock, $options, $catUrlData, blockId) {
        var $catUrl = $productBlock.data($catUrlData);

        if ($catUrl != undefined) {
            $catUrl = $catUrl.replace(/https?:\/\/[^/]+/, '');

            utils.api.getPage($catUrl, $options, (err, response) => {
                $productBlock.html(response);
                var newText = $productBlock.parent().find('.newTextAjax').text();

                $productBlock.find('.card').each(function() {
                    var id = $(this).data('product-id');
                    var a = arrNew.indexOf($(this).data('product-id'));
                    if( a != -1){                       
                        $(this).find('.themevale_badges').prepend('<div class="new-badge themevale_badge"><span class="text">'+newText+'</span></div>')
                    }
                });

                themevale_AddOption(this.context,blockId);
                this.productsShowMore();
                $('[data-slick]', $productBlock).slick();
            });
        }
    }

    // Load products in a Category Tabs: block New Arrivals Homepage 2
    homeProductsByCategoryTabs() {
        var $catUrlData ='themevale-products-by-category-tabs';
        const $options = {
            template: 'themevale/homepage/component/ajax-products-by-category-result'
        };
        var productBlock = $('.themevale_product-tabs .tab-content.is-active [data-themevale-products-by-category-tabs]');
        var blockId = productBlock.attr('id');

        // Loading the products for the tab is activated
        if ($('.themevale_product-tabs .tab-content.is-active [data-themevale-products-by-category-tabs]').length) {
            this.loadProduct2($(productBlock), $options, $catUrlData, blockId);
        }

        // Loading the products when click on a tab
        $('.themevale_product-tabs [data-tab]').on('toggled', (event, tab) => {
            var productBlock = $('.themevale_product-tabs .tab-content.is-active [data-themevale-products-by-category-tabs]');
            var blockId = productBlock.attr('id');

            this.loadProduct2($(productBlock), $options, $catUrlData, blockId);
        });
    }

    // Load products in a Category Sorting by Tabs: block New In on Homepage 15
    homeProductsByCategorySortingTabs() {
        var $catUrlData ='themevale-products-by-category-sorting-tabs';
        const $options = {
            template: 'themevale/homepage/component/ajax-products-by-category-sorting-tabs-result'
        };
            
        // Ajax request loading products in the active tab
        $('.is-active[data-themevale-products-by-category-sorting-tabs]').each((i, productBlock) => {
            var blockId = $(productBlock).attr('id');
            this.loadProduct2($(productBlock), $options, $catUrlData, blockId);
        });

        $('.themevale_productsByCategorySortTabs [data-tab]').on('toggled', (event, tab) => {
            var productBlock = $(tab).find('a').attr('href');
            var blockId = productBlock.replace('#','');

            this.loadProduct2($(productBlock), $options, $catUrlData, blockId);
        });
    }

    loadProduct2($productBlock, $options, $catUrlData, blockId) {
        var $catUrl = $productBlock.data($catUrlData);

        if ($catUrl != undefined) {
            $catUrl = $catUrl.replace(/https?:\/\/[^/]+/, '');

            utils.api.getPage($catUrl, $options, (err, response) => {
                $productBlock.html(response);
                var newText = $productBlock.parent().find('.newTextAjax').text();

                $productBlock.find('.card').each(function() {
                    var id = $(this).data('product-id');
                    var a = arrNew.indexOf($(this).data('product-id'));
                    if( a != -1){                       
                        $(this).find('.themevale_badges').prepend('<div class="new-badge themevale_badge"><span class="text">'+newText+'</span></div>')
                    }
                });

                themevale_AddOption(this.context,blockId);
                $('[data-slick]', $productBlock).slick();
            });
        } 
    }

    slickMarketingBanner() {
        //Image collection 3 - (8/10)
        if ($('.image-collection-3').length) {
            if (!$('.image-collection-3').hasClass('slick-slider')) {
                $('.image-collection-3').slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 2,
                    slidesToScroll: 2,               
                    nextArrow: "<svg class='slick-next slick-arrow' aria-label='Next Banner'><use xlink:href='#icon-slick-next'></use></svg>", 
                    prevArrow: "<svg class='slick-prev slick-arrow' aria-label='Previous Banner'><use xlink:href='#icon-slick-prev'></use></svg>",
                    responsive: [
                    {
                        breakpoint: 1280,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 5,
                            arrows: true,
                            dots: false
                        }
                    },
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 5
                        }
                    },
                    {
                        breakpoint: 800,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4
                        }
                    },
                    {
                        breakpoint: 550,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    }] 
                });
            }
        }

        //Image collection 8 - (10/3)
        if ($('.image-collection-8').length) {
            if (!$('.image-collection-8').hasClass('slick-slider')) {
                $('.image-collection-8').slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 2,
                    slidesToScroll: 2,               
                    nextArrow: "<svg class='slick-next slick-arrow' aria-label='Next Banner'><use xlink:href='#icon-slick-next'></use></svg>", 
                    prevArrow: "<svg class='slick-prev slick-arrow' aria-label='Previous Banner'><use xlink:href='#icon-slick-prev'></use></svg>",
                    responsive: [
                    {
                        breakpoint: 1280,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 5,
                            arrows: false,
                            dots: false
                        }
                    },
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 5
                        }
                    },
                    {
                        breakpoint: 800,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4
                        }
                    },
                    {
                        breakpoint: 550,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    }] 
                });
            }
        }

        //Image collection 10 - (8/3)
        if ($('.image-collection-10').length) {
            if (!$('.image-collection-10').hasClass('slick-slider')) {
                $('.image-collection-10').slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 2,
                    slidesToScroll: 2,               
                    nextArrow: "<svg class='slick-next slick-arrow' aria-label='Next Banner'><use xlink:href='#icon-slick-next'></use></svg>", 
                    prevArrow: "<svg class='slick-prev slick-arrow' aria-label='Previous Banner'><use xlink:href='#icon-slick-prev'></use></svg>",
                    responsive: [
                    {
                        breakpoint: 1280,
                        settings: {
                            slidesToShow: 6,
                            slidesToScroll: 6,
                            arrows: true,
                            dots: false
                            
                        }
                    },
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 5
                        }
                    },
                    {
                        breakpoint: 800,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4
                        }
                    },
                    {
                        breakpoint: 550,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    }] 
                });
            }
        }

        //Image collection 4 - (12)
        if ($('.image-collection-4').length) {
            if (!$('.image-collection-4').hasClass('slick-slider')) {
                $('.image-collection-4').slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,               
                    nextArrow: "<svg class='slick-next slick-arrow' aria-label='Next Banner'><use xlink:href='#icon-slick-next'></use></svg>", 
                    prevArrow: "<svg class='slick-prev slick-arrow' aria-label='Previous Banner'><use xlink:href='#icon-slick-prev'></use></svg>",
                    responsive: [
                    {
                        breakpoint: 800,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3,
                            arrows: false,
                            dots: true                        
                        }
                    },
                    {
                        breakpoint: 414,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    }] 
                });
            }
        }

        //Image collection 12 - (4)
        if ($('.image-collection-12').length) {
            if (!$('.image-collection-12').hasClass('slick-slider')) {
                $('.image-collection-12').slick({
                    dots: true,
                    arrows: false,
                    infinite: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,               
                    nextArrow: "<svg class='slick-next slick-arrow' aria-label='Next Banner'><use xlink:href='#icon-slick-next'></use></svg>", 
                    prevArrow: "<svg class='slick-prev slick-arrow' aria-label='Previous Banner'><use xlink:href='#icon-slick-prev'></use></svg>",
                    responsive: [
                    {
                        breakpoint: 800,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3,
                            arrows: false,
                            dots: false                        
                        }
                    },
                    {
                        breakpoint: 414,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    }] 
                });
            }
        }

        //Image collection 23
        if ($('.image-collection-23').length) {
            if (!$('.image-collection-23').hasClass('slick-slider')) {
                $('.image-collection-23').slick({
                    dots: true,
                    arrows: false,
                    mobileFirst: true,
                    infinite: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    nextArrow: "<svg class='slick-next slick-arrow' aria-label='Next Banner'><use xlink:href='#icon-slick-next'></use></svg>", 
                    prevArrow: "<svg class='slick-prev slick-arrow' aria-label='Previous Banner'><use xlink:href='#icon-slick-prev'></use></svg>",
                    responsive: [
                    {
                        breakpoint: 800,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2,
                            arrows: false,
                            dots: true                        
                        }
                    },
                    {
                        breakpoint: 414,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    }] 
                });
            }
        }

        //Image collection 25
        if ($('.image-collection-25 .image-collection-slider').length) {
            if (!$('.image-collection-25 .image-collection-slider').hasClass('slick-slider')) {
                $('.image-collection-25 .image-collection-slider').slick({
                    dots: true,
                    arrows: false,
                    autoplay: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    adaptiveHeight: true
                });
            }
        }

        //Brands Carousel 1
        if ($('.brandSlider1').length) {
            if (!$('.brandSlider1').hasClass('slick-slider')) {
                $('.brandSlider1').slick({
                    dots: false,
                    arrows: true,
                    mobileFirst: true,
                    infinite: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: false,
                    adaptiveHeight: true,
                    nextArrow: "<svg class='slick-next slick-arrow' aria-label='Next Brand'><use xlink:href='#icon-slick-next'></use></svg>", 
                    prevArrow: "<svg class='slick-prev slick-arrow' aria-label='Previous Brand'><use xlink:href='#icon-slick-prev'></use></svg>",
                    responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 5                
                        }
                    },
                    {
                        breakpoint: 768,   // Screen Ipad Mini 768 only show 3 brand images
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4           
                        }
                    },
                    {
                        breakpoint: 550,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3           
                        }
                    },
                    {
                        breakpoint: 430,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    }] 
                });
            }
        }

        //Brands Carousel 2
        if ($('.brandSlider2').length) {
            if (!$('.brandSlider2').hasClass('slick-slider')) {
                $('.brandSlider2').slick({
                    dots: false,
                    arrows: true,
                    mobileFirst: true,
                    infinite: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: false,
                    adaptiveHeight: true,
                    nextArrow: "<svg class='slick-next slick-arrow' aria-label='Next Brand'><use xlink:href='#icon-slick-next'></use></svg>", 
                    prevArrow: "<svg class='slick-prev slick-arrow' aria-label='Previous Brand'><use xlink:href='#icon-slick-prev'></use></svg>",
                    responsive: [
                    {
                        breakpoint: 1280,
                        settings: {
                            slidesToShow: 6,
                            slidesToScroll: 6                
                        }
                    },
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 5                
                        }
                    },
                    {
                        breakpoint: 768,   // Screen Ipad Mini 768 only show 3 brand images
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4           
                        }
                    },
                    {
                        breakpoint: 550,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3           
                        }
                    },
                    {
                        breakpoint: 430,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    }] 
                });
            }
        }

        //Brands Carousel 3
        if ($('.brandSlider3').length) {
            if (!$('.brandSlider3').hasClass('slick-slider')) {
                $('.brandSlider3').slick({
                    dots: false,
                    arrows: true,
                    mobileFirst: true,
                    infinite: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: false,
                    adaptiveHeight: true,
                    nextArrow: "<svg class='slick-next slick-arrow' aria-label='Next Brand'><use xlink:href='#icon-slick-next'></use></svg>", 
                    prevArrow: "<svg class='slick-prev slick-arrow' aria-label='Previous Brand'><use xlink:href='#icon-slick-prev'></use></svg>",
                    responsive: [
                    {
                        breakpoint: 768,    // Screen Ipad Mini 768 only show 3 brand images
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4           
                        }
                    },
                    {
                        breakpoint: 550,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3           
                        }
                    },
                    {
                        breakpoint: 430,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    }] 
                });
            }
        }

        //Brands Carousel 4
        if ($('.brandSlider4').length) {
            if (!$('.brandSlider4').hasClass('slick-slider')) {
                $('.brandSlider4').slick({
                    dots: false,
                    arrows: true,
                    mobileFirst: true,
                    infinite: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: false,
                    adaptiveHeight: true,
                    rows: 1,
                    nextArrow: "<svg class='slick-next slick-arrow' aria-label='Next Brand'><use xlink:href='#icon-slick-next'></use></svg>", 
                    prevArrow: "<svg class='slick-prev slick-arrow' aria-label='Previous Brand'><use xlink:href='#icon-slick-prev'></use></svg>",
                    responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 5,
                            dots: false,
                            arrows: false,
                            rows: 2       
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4           
                        }
                    },
                    {
                        breakpoint: 550,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3           
                        }
                    },
                    {
                        breakpoint: 430,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    }] 
                });
            }
        }

        //Featured 4
        if ($('.themevale-featured-4').length) {
            if (!$('.themevale-featured-4').hasClass('slick-slider')) {
                $('.themevale-featured-4').slick({
                    dots: true,
                    arrows: false,
                    mobileFirst: true,
                    infinite: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 5000,
                    responsive: [
                    {
                        breakpoint: 768,    // Screen Ipad Mini 768px only show 2 items
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3           
                        }
                    },
                    {
                        breakpoint: 550,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2           
                        }
                    }] 
                });
            }
        }

    }
}
