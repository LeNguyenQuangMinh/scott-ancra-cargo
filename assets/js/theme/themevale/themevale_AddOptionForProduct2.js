import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';

export default function(context) {
    if (context.themeSettings.themevale_AddOptionForProduct == true) {
        const product_class = ".themevale_product-tabs .card";
        var product_image = [];
        var product_hover = [];

        $(document).ready(function() {
            callProductOption();
            chooseOption();
        });

        function callProductOption() {
            $(product_class).each(function() {
                var $product = $(this);
                var productId = $product.attr("data-product-id");
                var colorVariantToShow = 4;
                var productLink = $product.find('.product_img_link').attr('href');
                
                if (productId != undefined) {
                    utils.api.product.getById(productId, { template: 'themevale/themevale_AddOptionForProduct' }, (err, response) => {
                        if ($('[data-product-attribute="swatch"]', response).length == 1) {
                            var $response = $(response).find('.form-label--alternate').remove().end();
                            response = $response;
                            var count_option = $('[data-product-attribute-value]',$('[data-product-attribute="swatch"]', response)).length;
                            var more_option = (count_option - colorVariantToShow);
                            var data_option = $('[data-product-attribute="swatch"]', response).html();
                            if(count_option > colorVariantToShow){
                                $('[data-product-attribute-value]',$('[data-product-attribute="swatch"]', response)).each(function(i){
                                    if(i>=colorVariantToShow){
                                        var option_id = $(this).attr('data-product-attribute-value');
                                        data_option = data_option.replace('data-product-attribute-value=\"'+option_id+'\"', 'data-product-attribute-value="'+option_id+'" data-show style="display:none;" ');
                                    }
                                });
                                data_option = data_option + '<span class="showmore"><a href="'+productLink+'" title="More Color">+'+more_option+'</a></span>';
                            }

                            var numbers = Math.floor((Math.random() * 10) + 1);

                            data_option = data_option.replace(new RegExp(escapeRegExp("attribute_"), 'g'), "attribute_" + productId + "_" + numbers + "_");
                            $product.find('.card_optionImage').remove();
                            $product.find('.card-body .card-price').after("<div class='card_optionImage product-option-" + productId + "'><div data-product-option-change><div data-product-attribute=\"swatch\">" + data_option + "</div></div></div>");


                            var $form = $('[data-product-attribute="swatch"]', productId);
                            $product.find('[data-product-attribute="swatch"] input[type="radio"]').each( function() {
                                var name = ($(this).attr('name'));
                                var value = $(this).val();
                                if( value != "") {
                                    utils.api.productAttributes.optionChange(productId, $form.serialize() + "&" + encodeURIComponent(name) + "=" + value , 'products/bulk-discount-rates', (err, response) => {
                                        const productAttributesData = response.data || {};

                                        if ($.isPlainObject(productAttributesData.image)) {

                                            const mainImageUrl = utils.tools.image.getSrc(
                                                productAttributesData.image.data,
                                                context.themeSettings.productgallery_size,
                                            );
                                            const thumnailImageUrl = utils.tools.image.getSrc(
                                                productAttributesData.image.data,
                                                context.themeSettings.productview_thumb_size,
                                            );
                                            $(this).next().find('.form-option-variant')
                                                .addClass('form-option--image')
                                                .attr('img-src', mainImageUrl)
                                                .css('background-image', 'url('+thumnailImageUrl+')');
                                        } 
                                    });
                                }
                            });
                        }

                        if ($('[data-product-attribute="set-rectangle"]', response).length == 1) {
                            var $response2 = $(response).find('.form-label--alternate').remove().end();
                            response = $response2;
                            var count_option2 = $('[data-product-attribute-value]',$('[data-product-attribute="set-rectangle"]', response)).length;
                            var more_option2 = (count_option2 - colorVariantToShow);
                            var data_option2 = $('[data-product-attribute="set-rectangle"]', response).html();
                            if(count_option2 > colorVariantToShow){
                                $('[data-product-attribute-value]',$('[data-product-attribute="set-rectangle"]', response)).each(function(i){
                                    if(i>=colorVariantToShow){
                                        var option_id2 = $(this).attr('data-product-attribute-value');
                                        data_option2 = data_option2.replace('data-product-attribute-value=\"'+option_id2+'\"', 'data-product-attribute-value="'+option_id2+'" data-show style="display:none;" ');
                                    }
                                });
                                data_option2 = data_option2 + '<span class="showmore"><a href="'+productLink+'" title="More Size">+'+more_option2+'</a></span>';
                            }
                            data_option2 = data_option2.replace(new RegExp(escapeRegExp("attribute_"), 'g'), "attribute_" + productId + "_");
                            $product.find('.card_optionSize').remove();
                            $product.find('.card-figure .card-figcaption2').prepend("<div class='card_optionSize product-option-" + productId + "'><div data-product-option-change><div data-product-attribute=\"set-rectangle\">" + data_option2 + "</div></div></div>");
                        }
                    });
                }

            });
        }

        function chooseOption() {
            $(document).on('click', '.form-option', function(event) {
                var img = $(this).children().attr('img-src');
                var $product_img = $(this).parents(product_class).find(".card-image");
                $product_img.attr("src", img);
                $product_img.attr("data-src", img);
                $('.card_optionImage .form-option').removeClass('active');
                $(this).addClass('active');
            });
        }

        function escapeRegExp(str) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }
    }

}
