import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import swal from 'sweetalert2';
import _ from 'lodash';

export default function(context) {
    const relate_tab = "#product-related";
    var currency = context.money,
        urlString = window.location.href,
        url = new URL(urlString),
        setCurrencyId = url.searchParams.get("setCurrencyId");

    // check custom field fbt
    showFBT();

    $(document).on('click', '.themvale-fbt-toggle-options', function() {
        if ($(this).next().is(':visible') == false) {
            $(this).next().slideDown();
        } else {
            $(this).next().slideUp();
        }
    });

    $(document).on('change', '.themvale-fbt-detail-checkbox', function() {
        var id = $(this).attr('id').replace('fbt_product', '');
        if ($(this).is(':checked') == false) {
            $('.themvale-fbt-image-item[data-product-id="' + id + '"]').removeClass('isChecked');
            $('.themvale-fbt-product-item[data-product-id="' + id + '"]').removeClass('isChecked');
            $(this).parents('form').find('.themvale-fbt-detail-options').slideUp();
        } else {
            $('.themvale-fbt-image-item[data-product-id="' + id + '"]').addClass('isChecked');
            $('.themvale-fbt-product-item[data-product-id="' + id + '"]').addClass('isChecked');
        }
        totalPrice();
    });

    $(document).on('click', '#themvale-fbt-addAll', function(event) {
        const $form = $('form', $('#halo-fbt'));
        var arrPro = new Array();
        $('.themvale-fbt-detail-checkbox').each(function(i, val) {
            if ($(val).is(':checked')) {
                arrPro.push(i);
            }
        });

        var check = false;

        if (arrPro.length > 0) {
            check = checkProduct($form, arrPro);
        }

        if (check) {
            if (arrPro.length > 0) {
                $('#halo-fbt .loadingOverlay').show();
                addToCart($form, 0, arrPro);
            }
        } else {
            swal({
                text: 'Please make sure all options have been filled in.',
                type: 'warning',
            });
        }

        event.preventDefault();
    });

    function showFBT() {
        // related product
        const options = {
                template: {
                    item: 'themevale/fbt-item',
                    options: 'themevale/fbt-options',
                    image: 'themevale/fbt-image',
                },
            };

        if ($('.productView-info-name.fbt').length > 0) {
            var num = 0;
            var list = [];

            $(relate_tab + ' .card').each(function(i, val) {
                list.push( {i:i, data: ""} );
                var pId = $(val).find('[data-product-id]').data('product-id');
                if (pId != undefined) {
                    utils.api.product.getById(pId, options, (err, response) => {
                        if (err) {
                            return '';
                        }
                        list.forEach(function(element) {
                            if(element.i == i){
                                element.data = response;
                            }
                        });
                        
                        num++;
                        if(num == $(relate_tab + ' .card').length)
                            showList(list);
                    });
                }

            });
        } else if ($('.productView-info-name.fbt-product').length > 0) {
            var num = 0;
            var list = [];

            $('.productView-info-value.fbt-product').each(function(i) {
                list.push( {i:i, data: ""} );
                if (!isNaN(Number($(this).text()))) {
                    var productId = Number($(this).text())
                    utils.api.product.getById(productId, options, (err, response) => {
                        if (err) {
                            return '';
                        }
                        list.forEach(function(element) {
                            if(element.i == i){
                                element.data = response;
                            }
                        });
                        num++;
                        if(num == $('.productView-info-value.fbt-product').length)
                            showList(list);
                    });
                } else {
                    utils.api.getPage($(this).text(), options, (err, response) => {
                        if (err) {
                            return '';
                        }
                        list.forEach(function(element) {
                            if(element.i == i){
                                element.data = response;
                            }
                        });
                        num++;
                        if(num == $('.productView-info-value.fbt-product').length)
                            showList(list);
                    });
                }
            });
        } else {
            $('#halo-fbt').remove();
        }
    }

    function showList(list){
        list.forEach(function(element) {
            var response = element.data;
            $('#halo-fbt .themvale-fbt-image-list').append(response.image);
            $('#halo-fbt .themvale-fbt-product-list').append(response.item);
            if (response.options.trim() != "") {
                var pId = $(response.item).data('product-id');
                const $form = $('#halo-fbt .themvale-fbt-product-list .themvale-fbt-product-item[data-product-id="' + pId + '"] form');
                $form.append(response.options);
                const $productOptionsElement = $('[data-fbt-option-change]', $form);
                const hasOptions = $productOptionsElement.html().trim().length;
                const hasDefaultOptions = $(response.options).find('[data-default]').length;
                if ( hasDefaultOptions && hasOptions) {
                    utils.api.productAttributes.optionChange(pId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
                        const attributesData = response.data || {};
                        const attributesContent = response.content || {};
                        updateProductAttributes($form, attributesData);
                        if (hasDefaultOptions) {
                            updateView($form, attributesData, attributesContent);
                        } else {
                            updateDefaultAttributesForOOS(attributesData);
                        }
                    });
                }
            }
        });
        $('#halo-fbt').show();
        productOptions();
        if (($(window).width() <= 1024)) {
            $('#halo-fbt .themvale-fbt-product-list').append('<div class="themvale-fbt-image-item fbt__total">\
              <p class="themevale-text-price"><span>Total Price:</span> <span class="themvale-fbt-total-price" id="themvale-fbt-totalPrice"></span></p>\
              <a class="button button--primary themvale-fbt-total-button" id="themvale-fbt-addAll" href="#">Add all to Cart</a>\
            </div>');
            
        } else {
            $('#halo-fbt').append('<div class="themvale-fbt-image-item fbt__total">\
              <p class="themevale-text-price"><span>Total Price:</span> <span class="themvale-fbt-total-price" id="themvale-fbt-totalPrice"></span></p>\
              <a class="button button--primary themvale-fbt-total-button" id="themvale-fbt-addAll" href="#">Add all to Cart</a>\
            </div>');
        }
        slick_mobile();
        totalPrice();
    }

    function slick_mobile() {
        $('.themvale-fbt-image-list').slick({
            infinite: false,
            slidesToShow: 5,
            slidesToScroll: 5,
            dots: false,
            arrows: true,
            nextArrow: '<svg class="slick-next slick-arrow" aria-label="Next"><use xlink:href="#icon-slick-next"></use></svg>',
            prevArrow: '<svg class="slick-prev slick-arrow" aria-label="Previous"><use xlink:href="#icon-slick-prev"></use></svg>',
            responsive: [{
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 4,
                        dots: false,
                        arrows: true
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        arrows: true,
                        dots: false,
                        slidesToScroll: 3,
                        slidesToShow: 3
                    }
                }
            ]
        });
    }

    function checkProduct(form, arrPro) {
        var check = true;

        for (var i = 0, len = arrPro.length; i < len; i++) {
            var k = arrPro[i];
            var $form = $(form[k]);
            if ($form.find('[data-fbt-option-change]').length) {
                check = checkBeforeAdd($form);
                if (check == false)
                    return false;
            }
        }
        return check;
    }

    function checkBeforeAdd($attributes) {
        var check = true;
        $attributes.find('input:text, input:password, input:file, textarea').each(function() {

            if (!$(this).prop('required')) {} else {
                if ($(this).val()) {} else {
                    $(this).focus();
                    check = false;
                }
            }
        });

        $attributes.find('select').each(function() {

            if (!$(this).prop('required')) {

            } else {
                if ($(this).val()) {} else {
                    $(this).focus();
                    check = false;
                }
            }
        });

        var att = "";
        $attributes.find('input:radio, input:checkbox').each(function() {
            if (att != $(this).attr("name")) {

                att = $(this).attr("name");
                if (!$(this).prop('required')) {
                    if ($(this).attr("type") == "checkbox") {
                        if ($("[name='" + att + "']:checked").val()) {}
                    }
                    if ($(this).attr("type") == "radio") {
                        if ($("[name='" + att + "']:checked").val()) {}
                    }
                } else {
                    if ($(this).attr("type") == "checkbox") {
                        if ($("[name='" + att + "']:checked").val()) {} else {
                            check = false;
                        }
                    }
                    if ($(this).attr("type") == "radio") {
                        if ($("[name='" + att + "']:checked").val()) {} else {
                            check = false;
                        }
                    }
                }
            }
        });

        return check;
    }

    function addToCart(form, i, arrP) {

        if (i >= arrP.length) {
            window.location = '/cart.php';
            return;
        }

        if (window.FormData === undefined) {
            return;
        }
        var k = arrP[i];
        // Add item to cart
        utils.api.cart.itemAdd(filterEmptyFilesFromForm(new FormData(form[k])), (err, response) => {
            const errorMessage = err || response.data.error;

            // Guard statement
            if (errorMessage) {
                // Strip the HTML from the error message
                const tmp = document.createElement('DIV');
                tmp.innerHTML = errorMessage;
                alert(tmp.textContent || tmp.innerText);
            }
            i++;
            if (i >= arrP.length) {
                window.location = '/cart.php';
                return;
            }
            addToCart(form, i, arrP);
            // return response.data.cart_item.product_id;
        });
    }

    function totalPrice() {
        var total = 0,
            symbol,
            symbolPosition = 0,
            decimalPlaces,
            decimalSeparator,
            thousandsSeparator;

        decimalPlaces = currency.decimal_places;
        decimalSeparator = currency.decimal_token;
        thousandsSeparator = currency.thousands_token;
        symbol = currency.currency_token;
        
        $('.themvale-fbt-product-item.isChecked').each((index, val) => {
            var price = parseFloat($(val).find('[data-price-value]').attr('data-price-value'));
            total = total + price;
        });

        if ($('#product-listing-container .productView-details .productView-price > .price-section > .price.price--withTax').length) {
            var curr = $('#product-listing-container .productView-details .productView-price > .price-section > .price.price--withTax').text();
        } else {
            var curr = $('#product-listing-container .productView-details .productView-price > .price-section > .price.price--withoutTax').text();
        }

        symbol = curr.replace(/[0-9]/g, "").replace(".", "").replace(",", "");
        var token1 = (curr.indexOf('.'));
        var token2 = (curr.indexOf(','));
        var length = curr.length - 1;

        if (curr.indexOf(symbol) != -1) {
            symbolPosition = curr.indexOf(symbol);
        }

        if (token1 < token2) {
            thousandsSeparator = '.';
            decimalSeparator = ',';
            if (symbolPosition == 0) {
                decimalPlaces = length - token2;
            } else {
                decimalPlaces = length - token2 - 1;
            }
        } else {
            thousandsSeparator = ',';
            decimalSeparator = '.';
            if (symbolPosition == 0) {
                decimalPlaces = length - token1;
            } else {
                decimalPlaces = length - token1 - 1;
            }
        }

        total = formatMoney(total, decimalPlaces, decimalSeparator, thousandsSeparator);      
                
        if (symbolPosition == 0) {
            total = symbol + total;
        }
        else {
            total = total + symbol;
        }

        $('#themvale-fbt-totalPrice').html(total);
    }

    function formatMoney(n, c, d, t) {
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    function productOptions() {
        totalPrice();
        const $form = $('form', $(document));

        // var arrPro = new Array();
        for (var i = 0, len = $form.length; i < len; i++) {
            const $productOptionsElement = $('[data-fbt-option-change]', $form[i]);
            $productOptionsElement.on('change', event => {
                productOptionsChanged(event);
            });
        }

    }

    function productOptionsChanged(event) {
        const $changedOption = $(event.target);
        const $form = $changedOption.parents('form');
        const productId = $('[name="product_id"]', $form).val();

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }

        utils.api.productAttributes.optionChange(productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
            const productAttributesData = response.data || {};
            const productAttributesContent = response.content || {};
            showProductImage(productId, productAttributesData);
            updateProductAttributes($form, productAttributesData);
            updateView($form, productAttributesData, productAttributesContent);
            totalPrice();
        });
    }
    
    function updateProductAttributes($scope, data) {
        const behavior = data.out_of_stock_behavior;
        const inStockIds = data.in_stock_attributes;
        const outOfStockMessage = ` (${data.out_of_stock_message})`;

        if (behavior !== 'hide_option' && behavior !== 'label_option') {
            return;
        }

        $('[data-product-attribute-value]', $scope).each((i, attribute) => {
            const $attribute = $(attribute);
            const attrId = parseInt($attribute.data('productAttributeValue'), 10);


            if (inStockIds.indexOf(attrId) !== -1) {
                enableAttribute($attribute, behavior, outOfStockMessage);
            } else {
                disableAttribute($attribute, behavior, outOfStockMessage);
            }
        });
    }

    function disableAttribute($attribute, behavior, outOfStockMessage) {
        if (getAttributeType($attribute) === 'set-select') {
            return disableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.hide();
        } else {
            $attribute.addClass('unavailable');
        }
    }

    function disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        const $select = $attribute.parent();

        if (behavior === 'hide_option') {
            $attribute.toggleOption(false);
            // If the attribute is the selected option in a select dropdown, select the first option (MERC-639)
            if ($select.val() === $attribute.attr('value')) {
                $select[0].selectedIndex = 0;
            }
        } else {
            $attribute.attr('disabled', 'disabled');
            $attribute.html($attribute.html().replace(outOfStockMessage, '') + outOfStockMessage);
        }
    }

    function enableAttribute($attribute, behavior, outOfStockMessage) {
        if (getAttributeType($attribute) === 'set-select') {
            return enableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.show();
        } else {
            $attribute.removeClass('unavailable');
        }
    }

    function enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        if (behavior === 'hide_option') {
            $attribute.toggleOption(true);
        } else {
            $attribute.prop('disabled', false);
            $attribute.html($attribute.html().replace(outOfStockMessage, ''));
        }
    }

    function getAttributeType($attribute) {
        const $parent = $attribute.closest('[data-product-attribute]');

        return $parent ? $parent.data('productAttribute') : null;
    }

    function showProductImage(productId, data) {
        if (_.isPlainObject(data.image)) {

            const mainImageUrl = utils.tools.image.getSrc(
                data.image.data,
                context.themeSettings.product_size,
            );

            $('.themvale-fbt-image-item[data-product-id="' + productId + '"]').find('img').attr({
                'src': mainImageUrl,
                'data-src': $(this).attr('src'),
            });

        } else {
            const mainImageUrl = $('.themvale-fbt-image-item[data-product-id="' + productId + '"]').find('img').attr('data-src');
            $('.themvale-fbt-image-item[data-product-id="' + productId + '"]').find('img').attr({
                'src': mainImageUrl,
                'data-src': $(this).attr('src'),
            });
        }
    }

    function updateView($scope, data, content = null) {
        const viewModel = getViewModel($scope);

        if (_.isObject(data.price)) {
            updatePriceView(viewModel, data.price);
        }
        var productId = $('[name="product_id"]', $scope).val();

        if (!data.purchasable || !data.instock) {
            $('.themvale-fbt-image-item[data-product-id="' + productId + '"]').removeClass('isChecked');
            $('.themvale-fbt-product-item[data-product-id="' + productId + '"]').removeClass('isChecked');
            $('#fbt_product' + productId).prop('checked', false).prop('disabled', true);
            $('.themvale-fbt-product-item[data-product-id="' + productId + '"]').removeClass('hasOptions--selected');
        } else {
            $('.themvale-fbt-image-item[data-product-id="' + productId + '"]').addClass('isChecked');
            $('.themvale-fbt-product-item[data-product-id="' + productId + '"]').addClass('isChecked');
            $('#fbt_product' + productId).prop('checked', true).prop('disabled', false);

            if ($scope.find('[data-fbt-option-change]').length) {
                var check = checkBeforeAdd($scope);
                if (check == true) {
                    $('.themvale-fbt-product-item[data-product-id="' + productId + '"]').addClass('hasOptions--selected');
                    $('[data-fbt-option-change]', $scope).slideUp();
                }
            }
        }
    }

    function updateDefaultAttributesForOOS($scope, data) {
        var productId = $('[name="product_id"]', $scope).val();

        if (!data.purchasable || !data.instock) {
            $('.themvale-fbt-image-item[data-product-id="' + productId + '"]').removeClass('isChecked');
            $('.themvale-fbt-product-item[data-product-id="' + productId + '"]').removeClass('isChecked');
            $('#fbt_product' + productId).prop('checked', false).prop('disabled', true);
            $('.themvale-fbt-product-item[data-product-id="' + productId + '"]').removeClass('hasOptions--selected');
        } else {
            $('.themvale-fbt-image-item[data-product-id="' + productId + '"]').addClass('isChecked');
            $('.themvale-fbt-product-item[data-product-id="' + productId + '"]').addClass('isChecked');
            $('#fbt_product' + productId).prop('checked', true).prop('disabled', false);

            if ($scope.find('[data-fbt-option-change]').length) {
                var check = checkBeforeAdd($scope);
                if (check == true) {
                    $('.themvale-fbt-product-item[data-product-id="' + productId + '"]').addClass('hasOptions--selected');
                    $('[data-fbt-option-change]', $scope).slideUp();
                }
            }
        }
    }

    function getViewModel($scope) {
        return {
            $priceWithTax: $('[data-product-price-with-tax]', $scope),
            $priceWithoutTax: $('[data-product-price-without-tax]', $scope),
            rrpWithTax: {
                $div: $('.rrp-price--withTax', $scope),
                $span: $('[data-product-rrp-with-tax]', $scope),
            },
            rrpWithoutTax: {
                $div: $('.rrp-price--withoutTax', $scope),
                $span: $('[data-product-rrp-price-without-tax]', $scope),
            },
            nonSaleWithTax: {
                $div: $('.non-sale-price--withTax', $scope),
                $span: $('[data-product-non-sale-price-with-tax]', $scope),
            },
            nonSaleWithoutTax: {
                $div: $('.non-sale-price--withoutTax', $scope),
                $span: $('[data-product-non-sale-price-without-tax]', $scope),
            },
            priceSaved: {
                $div: $('.price-section--saving', $scope),
                $span: $('[data-product-price-saved]', $scope),
            },
            priceNowLabel: {
                $span: $('.price-now-label', $scope),
            },
            priceLabel: {
                $span: $('.price-label', $scope),
            },
            priceData: {
                $div: $('[data-price-value]', $scope),
            },
            $weight: $('.productView-info [data-product-weight]', $scope),
            $increments: $('.form-field--increments :input', $scope),
            $addToCart: $('#form-action-addToCart', $scope),
            $wishlistVariation: $('[data-wishlist-add] [name="variation_id"]', $scope),
            stock: {
                $container: $('.form-field--stock', $scope),
                $input: $('[data-product-stock]', $scope),
            },
            $sku: $('[data-product-sku]'),
            $upc: $('[data-product-upc]'),
            quantity: {
                $text: $('.incrementTotal', $scope),
                $input: $('[name=qty\\[\\]]', $scope),
            },
            $bulkPricing: $('.productView-info-bulkPricing', $scope),
        };
    }

    function clearPricingNotFound(viewModel) {
        viewModel.rrpWithTax.$div.hide();
        viewModel.rrpWithoutTax.$div.hide();
        viewModel.nonSaleWithTax.$div.hide();
        viewModel.nonSaleWithoutTax.$div.hide();
        viewModel.priceSaved.$div.hide();
        viewModel.priceNowLabel.$span.hide();
        viewModel.priceLabel.$span.hide();
    }
    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    function updatePriceView(viewModel, price) {
        clearPricingNotFound(viewModel);

        if (price.with_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithTax.html(price.with_tax.formatted);
            viewModel.priceData.$div.attr('data-price-value', price.with_tax.value);
        }

        if (price.without_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithoutTax.html(price.without_tax.formatted);
            viewModel.priceData.$div.attr('data-price-value', price.without_tax.value);
        }

        if (price.rrp_with_tax) {
            viewModel.rrpWithTax.$div.show();
            viewModel.rrpWithTax.$span.html(price.rrp_with_tax.formatted);
        }

        if (price.rrp_without_tax) {
            viewModel.rrpWithoutTax.$div.show();
            viewModel.rrpWithoutTax.$span.html(price.rrp_without_tax.formatted);
        }

        if (price.saved) {
            viewModel.priceSaved.$div.show();
            viewModel.priceSaved.$span.html(price.saved.formatted);
        }

        if (price.non_sale_price_with_tax) {
            viewModel.priceLabel.$span.hide();
            viewModel.nonSaleWithTax.$div.show();
            viewModel.priceNowLabel.$span.show();
            viewModel.nonSaleWithTax.$span.html(price.non_sale_price_with_tax.formatted);
        }

        if (price.non_sale_price_without_tax) {
            viewModel.priceLabel.$span.hide();
            viewModel.nonSaleWithoutTax.$div.show();
            viewModel.priceNowLabel.$span.show();
            viewModel.nonSaleWithoutTax.$span.html(price.non_sale_price_without_tax.formatted);
        }
    }

    /**
     * https://stackoverflow.com/questions/49672992/ajax-request-fails-when-sending-formdata-including-empty-file-input-in-safari
     * Safari browser with jquery 3.3.1 has an issue uploading empty file parameters. This function removes any empty files from the form params
     * @param formData: FormData object
     * @returns FormData object
     */
    function filterEmptyFilesFromForm(formData) {
        try {
            for (const [key, val] of formData) {
                if (val instanceof File && !val.name && !val.size) {
                    formData.delete(key);
                }
            }
        } catch (e) {
            console.error(e); // eslint-disable-line no-console
        }
        return formData;
    }

}
