import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.reveal';
import ImageGallery from '../product/image-gallery';
import modalFactory from '../global/modal';
import _ from 'lodash';
import swal from 'sweetalert2';
import Wishlist from '../wishlist';
import 'resizeSensor';
import 'stickySidebar';
import Sortable from 'sortablejs';

export default class ProductDetails {
    constructor($scope, context, productAttributesData = {}) {
        this.$overlay = $('[data-cart-item-add] .loadingOverlay');
        this.$scope = $scope;
        this.context = context;
        this.imageGallery = new ImageGallery($('[data-image-gallery]', this.$scope));
        this.imageGallery.init();
        this.listenQuantityChange();
        this.initRadioAttributes();
        Wishlist.load(this.context);
        this.getTabRequests();
        this.productThumbnailScroll();
        this.productSticky();
        if (('.sold-product').length) {
            this.soldProduct(this.context);
        }

        if (('.viewing-product').length) {
            this.viewingProduct(this.context);
        }

        if (this.context.themeSettings.enable_compare_color == true) {
            this.compareColor();
        }

        const $form = $('form[data-cart-item-add]', $scope);
        const $productOptionsElement = $('[data-product-option-change]', $form);        
        const hasOptions = $productOptionsElement.html().trim().length;
        const hasDefaultOptions = $productOptionsElement.find('[data-default]').length;

        $productOptionsElement.on('change', event => {
            this.productOptionsChanged(event);
            this.setProductVariant();
            this.setProductVariant2();
        });

        $form.on('submit', event => {
            this.addProductToCart(event, $form[0]);
        });

        // add to cart 2
        const $form2 = $('form.form-popup[data-cart-item-add-2]', $scope);
        const $productOptionsElement2 = $('[data-product-option-change-2]', $form2);

        $productOptionsElement2.on('change', event => {
            this.productOptionsChanged2(event);
            this.setProductVariant();
            this.setProductVariant2();
        });

        $(document).on('click', '#form-action-addToCart.themevale', function(event){
            $form2.submit();
        });

        $form2.on('submit', event => {
            this.addProductToCart(event, $form2[0]);
        });

        // Update product attributes. Also update the initial view in case items are oos
        // or have default variant properties that change the view
        if ((_.isEmpty(productAttributesData) || hasDefaultOptions) && hasOptions) {
            const $productId = $('[name="product_id"]', $form).val();

            utils.api.productAttributes.optionChange($productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
                const attributesData = response.data || {};
                const attributesContent = response.content || {};
                this.updateProductAttributes(attributesData);
                if (hasDefaultOptions) {
                    this.updateView(attributesData, attributesContent);
                } else {
                    this.updateDefaultAttributesForOOS(attributesData);
                }
            });
        } else {
            this.updateProductAttributes(productAttributesData);
        }

        $productOptionsElement.show();

        this.previewModal = modalFactory('#previewModal')[0];

        const productId = $('[name="product_id"]', $form).val();
        this.progressBarProduct(productId);
        this.progressBarProduct2();

    }

    /**
     * https://stackoverflow.com/questions/49672992/ajax-request-fails-when-sending-formdata-including-empty-file-input-in-safari
     * Safari browser with jquery 3.3.1 has an issue uploading empty file parameters. This function removes any empty files from the form params
     * @param formData: FormData object
     * @returns FormData object
     */
    filterEmptyFilesFromForm(formData) {
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

    setProductVariant() {
        const unsatisfiedRequiredFields = [];
        const options = [];

        $.each($('[data-product-option-change] [data-product-attribute]'), (index, value) => {
            const optionLabel = value.children[0].innerText;
            const optionTitle = optionLabel.split(':')[0].trim();
            const required = optionLabel.toLowerCase().includes('required');
            const type = value.getAttribute('data-product-attribute');

            if ((type === 'input-file' || type === 'input-text' || type === 'input-number') && value.querySelector('input').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'textarea' && value.querySelector('textarea').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'date') {
                const isSatisfied = Array.from(value.querySelectorAll('select')).every((select) => select.selectedIndex !== 0);

                if (isSatisfied) {
                    const dateString = Array.from(value.querySelectorAll('select')).map((x) => x.value).join('-');
                    options.push(`${optionTitle}:${dateString}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-select') {
                const select = value.querySelector('select');
                const selectedIndex = select.selectedIndex;

                if (selectedIndex !== 0) {
                    options.push(`${optionTitle}:${select.options[selectedIndex].innerText}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-rectangle' || type === 'set-radio' || type === 'swatch' || type === 'input-checkbox' || type === 'product-list') {
                const checked = value.querySelector(':checked');
                
                if (checked != null) {
                    if (type === 'set-rectangle' || type === 'set-radio' || type === 'product-list') {
                        if(checked.labels[0]){
                            const label = checked.labels[0].innerText;
                            if (label) {
                                options.push(`${optionTitle}:${label}`);
                            }
                        }
                    }

                    if (type === 'swatch') {
                        const label = checked.labels[0].children[0];
                        if (label) {
                            options.push(`${optionTitle}:${label.title}`);
                        }
                    }

                    if (type === 'input-checkbox') {
                        options.push(`${optionTitle}:Yes`);
                    }

                    return;
                }

                if (type === 'input-checkbox') {
                    options.push(`${optionTitle}:No`);
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }
        });

        let productVariant = unsatisfiedRequiredFields.length === 0 ? options.sort().join(', ') : 'unsatisfied';
        const view = $('.productView');

        if (productVariant) {
            productVariant = productVariant === 'unsatisfied' ? '' : productVariant;
            if (view.attr('data-event-type')) {
                view.attr('data-product-variant', productVariant);
            } else {
                const productName = view.find('.productView-title')[0].innerText;
                const card = $(`[data-name="${productName}"]`);
                card.attr('data-product-variant', productVariant);
            }
        }
    }
    setProductVariant2() {
        const unsatisfiedRequiredFields = [];
        const options = [];

        $.each($('[data-product-option-change-2] [data-product-attribute]'), (index, value) => {
            const optionLabel = value.children[0].innerText;
            const optionTitle = optionLabel.split(':')[0].trim();
            const required = optionLabel.toLowerCase().includes('required');
            const type = value.getAttribute('data-product-attribute');

            if ((type === 'input-file' || type === 'input-text' || type === 'input-number') && value.querySelector('input').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'textarea' && value.querySelector('textarea').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'date') {
                const isSatisfied = Array.from(value.querySelectorAll('select')).every((select) => select.selectedIndex !== 0);

                if (isSatisfied) {
                    const dateString = Array.from(value.querySelectorAll('select')).map((x) => x.value).join('-');
                    options.push(`${optionTitle}:${dateString}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-select') {
                const select = value.querySelector('select');
                const selectedIndex = select.selectedIndex;

                if (selectedIndex !== 0) {
                    options.push(`${optionTitle}:${select.options[selectedIndex].innerText}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-rectangle' || type === 'set-radio' || type === 'swatch' || type === 'input-checkbox' || type === 'product-list') {
                const checked = value.querySelector(':checked');
                
                if (checked != null) {
                    if (type === 'set-rectangle' || type === 'set-radio' || type === 'product-list') {
                        if(checked.labels[0]){
                            const label = checked.labels[0].innerText;
                            if (label) {
                                options.push(`${optionTitle}:${label}`);
                            }
                        }
                    }

                    if (type === 'swatch') {
                        const label = checked.labels[0].children[0];
                        if (label) {
                            options.push(`${optionTitle}:${label.title}`);
                        }
                    }

                    if (type === 'input-checkbox') {
                        options.push(`${optionTitle}:Yes`);
                    }

                    return;
                }

                if (type === 'input-checkbox') {
                    options.push(`${optionTitle}:No`);
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }
        });

        let productVariant = unsatisfiedRequiredFields.length === 0 ? options.sort().join(', ') : 'unsatisfied';
        const view = $('.productView');

        if (productVariant) {
            productVariant = productVariant === 'unsatisfied' ? '' : productVariant;
            if (view.attr('data-event-type')) {
                view.attr('data-product-variant', productVariant);
            } else {
                const productName = view.find('.productView-title')[0].innerText;
                const card = $(`[data-name="${productName}"]`);
                card.attr('data-product-variant', productVariant);
            }
        }
    }

    /**
     * Since $productView can be dynamically inserted using render_with,
     * We have to retrieve the respective elements
     *
     * @param $scope
     */
    getViewModel($scope) {
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
            $weight: $('.productView-info [data-product-weight]', $scope),
            $increments: $('.form-field--increments :input', $scope),
            $addToCart: $('#form-action-addToCart', $scope),
            $addToCart2: $('#sticky_addtocart #form-action-addToCart', $scope),
            $wishlistVariation: $('[data-wishlist-add] [name="variation_id"]', $scope),
            stock: {
                $container: $('.form-field--stock', $scope),
                $input: $('[data-product-stock]', $scope),
            },
            $sku: $('[data-product-sku]', $scope),
            $upc: $('[data-product-upc]'),
            quantity: {
                $text: $('.incrementTotal', $scope),
                $input: $('[name=qty\\[\\]]', $scope),
            },
            $bulkPricing: $('.productView-info-bulkPricing', $scope),
        };
    }

    /**
     * Checks if the current window is being run inside an iframe
     * @returns {boolean}
     */
    isRunningInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    /**
     *
     * Handle product options changes
     *
     */
    productOptionsChanged(event) {
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
            this.updateProductAttributes(productAttributesData);
            this.updateView(productAttributesData, productAttributesContent);

            // Change Sticky Add to cart
            $.each($('[data-product-option-change] [data-product-attribute] input'), function(i) {
                var el;
                if ($(this).is(":checked") == true) {
                    el = $(this).attr('value');
                }
                $.each($('[data-product-option-change-2] [data-product-attribute] input'), function(i) {
                    var op = $(this).attr('value');
                    if(el == op){
                        $(this).prop('checked', true);

                        if ($(this).next().hasClass('form-option-swatch')) {
                            var opTitle = $(this).next().children('.form-option-variant').attr('title');
                        } else if ($(this).next().children('.form-option-variant').length) {
                            var opTitle = $(this).next().children('.form-option-variant').text();
                        } else {
                            var opTitle = $(this).next('.form-label').text();
                        }
                        $(this).parents('[data-product-attribute]').find('.form-label--alternate [data-option-value]').text(opTitle);
                    }
                })
            });
        });        
    }

    productOptionsChanged2(event) {
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
            this.updateProductAttributes(productAttributesData);
            this.updateView(productAttributesData, productAttributesContent);

            setTimeout(function(){ 
                var change_img = $('.productView-images [data-image-gallery-main-0] .zoomImg').attr('src');
                $('#sticky_addtocart .product-image img').attr('src', change_img);
            }, 100);
            
            $.each($('[data-product-option-change-2] [data-product-attribute]'), function(i) {
                var el = $(this).find('.form-radio:checked').attr('value');
                $.each($('.productView-options [data-product-option-change] [data-product-attribute] input'), function(i) {
                    var op = $(this).attr('value');
                    if ($(this).next().hasClass('form-option-swatch')) {
                        var opTitle = $(this).next().children('.form-option-variant').attr('title');
                    } else if ($(this).next().children('.form-option-variant').length) {
                        var opTitle = $(this).next().children('.form-option-variant').text();
                    } else {
                        var opTitle = $(this).next('.form-label').text();
                    }

                    if(el == op){
                        $(this).prop('checked', true);
                        $(this).parents('[data-product-attribute]').find('.form-label--alternate [data-option-value]').text(opTitle);
                    }
                })
            });

            var checkedColor = $('[data-product-option-change-2] [data-product-attribute="swatch"]').find('.form-radio:checked').attr('value');
            var color = $('[data-product-option-change-2] [data-product-attribute="swatch"]').find('.form-radio:checked').next().find('> span').attr('title');
            $('#sticky_addtocart .productView-title .color-name').text(" - " +color);
        });
    }

    showProductImage(image) {
        if (_.isPlainObject(image)) {
            const zoomImageUrl = utils.tools.image.getSrc(
                image.data,
                this.context.themeSettings.zoom_size,
            );

            const mainImageUrl = utils.tools.image.getSrc(
                image.data,
                this.context.themeSettings.product_size,
            );

            this.imageGallery.setAlternateImage({
                mainImageUrl,
                zoomImageUrl,
            });
        } else {
            this.imageGallery.restoreImage();
        }
    }

    /**
     *
     * Handle action when the shopper clicks on + / - for quantity
     *
     */
    listenQuantityChange() {
        this.$scope.on('click', '[data-quantity-change] button', event => {
            event.preventDefault();
            const $target = $(event.currentTarget);
            const viewModel = this.getViewModel(this.$scope);
            const $input = viewModel.quantity.$input;
            const quantityMin = parseInt($input.data('quantityMin'), 10);
            const quantityMax = parseInt($input.data('quantityMax'), 10);

            let qty = parseInt($input.val(), 10);

            // If action is incrementing
            if ($target.data('action') === 'inc') {
                // If quantity max option is set
                if (quantityMax > 0) {
                    // Check quantity does not exceed max
                    if ((qty + 1) <= quantityMax) {
                        qty++;
                    }
                } else {
                    qty++;
                }
            } else if (qty > 1) {
                // If quantity min option is set
                if (quantityMin > 0) {
                    // Check quantity does not fall below min
                    if ((qty - 1) >= quantityMin) {
                        qty--;
                    }
                } else {
                    qty--;
                }
            }

            // update hidden input
            viewModel.quantity.$input.val(qty);
            // update text
            viewModel.quantity.$text.text(qty);
        });
    }

    /**
     *
     * Add a product to cart
     *
     */
    addProductToCart(event, form) {
        const $addToCartBtn = $('#form-action-addToCart', $(event.target));
        const originalBtnVal = $addToCartBtn.val();
        const waitMessage = $addToCartBtn.data('waitMessage');

        // Do not do AJAX if browser doesn't support FormData
        if (window.FormData === undefined) {
            return;
        }

        // Prevent default

        event.preventDefault();

        $addToCartBtn
            .val(waitMessage)
            .prop('disabled', true);

        this.$overlay.show();

        // Add item to cart
        utils.api.cart.itemAdd(this.filterEmptyFilesFromForm(new FormData(form)), (err, response) => {
            const errorMessage = err || response.data.error;

            $addToCartBtn
                .val(originalBtnVal)
                .prop('disabled', false);

            this.$overlay.hide();

            // Guard statement
            if (errorMessage) {
                // Strip the HTML from the error message
                const tmp = document.createElement('DIV');
                tmp.innerHTML = errorMessage;

                return swal({
                    text: tmp.textContent || tmp.innerText,
                    type: 'error',
                });
            }

            // Open preview modal and update content
            if (this.previewModal) {
                this.previewModal.open();

                this.updateCartContent(this.previewModal, response.data.cart_item.hash);
            } else {
                this.$overlay.show();
                // if no modal, redirect to the cart page
                this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart);
            }
        });
    }

    /**
     * Get cart contents
     *
     * @param {String} cartItemHash
     * @param {Function} onComplete
     */
    getCartContent(cartItemHash, onComplete) {
        const options = {
            template: 'cart/preview',
            params: {
                suggest: cartItemHash,
            },
            config: {
                cart: {
                    suggestions: {
                        limit: 4,
                    },
                },
            },
        };

        utils.api.cart.getContent(options, onComplete);
    }

    /**
     * Redirect to url
     *
     * @param {String} url
     */
    redirectTo(url) {
        if (this.isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url;
        } else {
            window.location = url;
        }
    }

    /**
     * Update cart content
     *
     * @param {Modal} modal
     * @param {String} cartItemHash
     * @param {Function} onComplete
     */
    updateCartContent(modal, cartItemHash, onComplete) {
        this.getCartContent(cartItemHash, (err, response) => {
            if (err) {
                return;
            }

            modal.updateContent(response);

            // Update cart counter
            const $body = $('body');
            const $cartQuantity = $('[data-cart-quantity]', modal.$content);
            const $cartCounter = $('.navUser-action .cart-count');
            const quantity = $cartQuantity.data('cartQuantity') || 0;

            $cartCounter.addClass('cart-count--positive');
            $body.trigger('cart-quantity-update', quantity);

            if (onComplete) {
                onComplete(response);
            }
        });
    }

    /**
     * Show an message box if a message is passed
     * Hide the box if the message is empty
     * @param  {String} message
     */
    showMessageBox(message) {
        const $messageBox = $('.productAttributes-message');

        if (message) {
            $('.alertBox-message', $messageBox).text(message);
            $messageBox.show();
        } else {
            $messageBox.hide();
        }
    }

    /**
     * Hide the pricing elements that will show up only when the price exists in API
     * @param viewModel
     */
    clearPricingNotFound(viewModel) {
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
    updatePriceView(viewModel, price) {
        this.clearPricingNotFound(viewModel);

        if (price.with_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithTax.html(price.with_tax.formatted);
        }

        if (price.without_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithoutTax.html(price.without_tax.formatted);
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
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updateView(data, content = null) {
        const viewModel = this.getViewModel(this.$scope);

        // Hot Stock
        if (_.isNumber(data.stock)) {
            if((data.stock <= parseInt(this.context.themeSettings.halo_stock_level_limit)) && (data.stock > 0)) {
                $('.productView-optionsStock').removeClass('u-hiddenVisually');
                $('[data-stock-left]').text(data.stock);
            } else{
                $('.productView-optionsStock').addClass('u-hiddenVisually');
            }
        }
        // End Hot Stock
        
        this.showMessageBox(data.stock_message || data.purchasing_message);

        if (_.isObject(data.price)) {
            this.updatePriceView(viewModel, data.price);
        }

        if (_.isObject(data.weight)) {
            viewModel.$weight.html(data.weight.formatted);
        }

        // Set variation_id if it exists for adding to wishlist
        if (data.variantId) {
            viewModel.$wishlistVariation.val(data.variantId);
        }

        // If SKU is available
        if (data.sku) {
            viewModel.$sku.text(data.sku);
        }

        // If UPC is available
        if (data.upc) {
            viewModel.$upc.text(data.upc);
        }

        // if stock view is on (CP settings)
        if (viewModel.stock.$container.length && _.isNumber(data.stock)) {
            // if the stock container is hidden, show
            viewModel.stock.$container.removeClass('u-hiddenVisually');

            viewModel.stock.$input.text(data.stock);
        } else {
            viewModel.stock.$container.addClass('u-hiddenVisually');
            viewModel.stock.$input.text(data.stock);
        }

        this.updateDefaultAttributesForOOS(data);

        // If Bulk Pricing rendered HTML is available
        if (data.bulk_discount_rates && content) {
            viewModel.$bulkPricing.html(content);
        } else if (typeof (data.bulk_discount_rates) !== 'undefined') {
            viewModel.$bulkPricing.html('');
        }
        const addToCartWrapper = $('#add-to-cart-wrapper');
        const addToCartWrapper2 = $('#add-to-cart-wrapper-2');

        if (addToCartWrapper.is(':hidden') && data.purchasable) {
            addToCartWrapper.show();
        }

        if (addToCartWrapper2.is(':hidden') && data.purchasable) {
            addToCartWrapper2.show();
        }
    }

    updateDefaultAttributesForOOS(data) {
        const viewModel = this.getViewModel(this.$scope);
        if (!data.purchasable || !data.instock) {
            viewModel.$addToCart.prop('disabled', true);
            viewModel.$addToCart2.prop('disabled',true);
            viewModel.$increments.prop('disabled', true);
        } else {
            viewModel.$addToCart.prop('disabled', false);
            viewModel.$addToCart2.prop('disabled',false);
            viewModel.$increments.prop('disabled', false);
        }
    }

    /**
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */
    updateProductAttributes(data) {
        const behavior = data.out_of_stock_behavior;
        const inStockIds = data.in_stock_attributes;
        const outOfStockMessage = ` (${data.out_of_stock_message})`;

        this.showProductImage(data.image);

        if (behavior !== 'hide_option' && behavior !== 'label_option') {
            return;
        }

        $('[data-product-attribute-value]', this.$scope).each((i, attribute) => {
            const $attribute = $(attribute);
            const attrId = parseInt($attribute.data('productAttributeValue'), 10);


            if (inStockIds.indexOf(attrId) !== -1) {
                this.enableAttribute($attribute, behavior, outOfStockMessage);
            } else {
                this.disableAttribute($attribute, behavior, outOfStockMessage);
            }
        });
    }

    disableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.disableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.hide();
        } else {
            $attribute.addClass('unavailable');
        }
    }

    disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
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

    enableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.enableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.show();
        } else {
            $attribute.removeClass('unavailable');
        }
    }

    enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        if (behavior === 'hide_option') {
            $attribute.toggleOption(true);
        } else {
            $attribute.prop('disabled', false);
            $attribute.html($attribute.html().replace(outOfStockMessage, ''));
        }
    }

    getAttributeType($attribute) {
        const $parent = $attribute.closest('[data-product-attribute]');

        return $parent ? $parent.data('productAttribute') : null;
    }

    /**
     * Allow radio buttons to get deselected
     */
    initRadioAttributes() {
        $('[data-product-attribute] input[type="radio"]', this.$scope).each((i, radio) => {
            const $radio = $(radio);

            // Only bind to click once
            if ($radio.attr('data-state') !== undefined) {
                $radio.on('click', () => {
                    if ($radio.data('state') === true) {
                        $radio.prop('checked', false);
                        $radio.data('state', false);

                        $radio.trigger('change');
                    } else {
                        $radio.data('state', true);
                    }

                    this.initRadioAttributes();
                });
            }

            $radio.attr('data-state', $radio.prop('checked'));
        });
    }

    /**
     * Check for fragment identifier in URL requesting a specific tab
     */
    getTabRequests() {
        if (window.location.hash && window.location.hash.indexOf('#tab-') === 0) {
            const $activeTab = $('.tabs').has(`[href='${window.location.hash}']`);
            const $tabContent = $(`${window.location.hash}`);

            if ($activeTab.length > 0) {
                $activeTab.find('.tab')
                    .removeClass('is-active')
                    .has(`[href='${window.location.hash}']`)
                    .addClass('is-active');

                $tabContent.addClass('is-active')
                    .siblings()
                    .removeClass('is-active');
            }
        }
    }

    // Compare Color Function
    compareColor() {
        if ($('.productView-details [data-product-option-change] [data-product-attribute="swatch"]').length > 0 && $('.productView-details [data-product-option-change] [data-product-attribute="swatch"] .form-option-swatch').length > 1) {
            $('.productView-nav-wrapper .compare-color').css('display','inline-block');
        }

        jQuery(document).on('click', '.compareColor-link',  function(e){
            var productId = $('.productView-details .productView-options form [name="product_id"]').val();
            var color = $('.productView-details [data-product-option-change] [data-product-attribute="swatch"]').html();
            $('.productView-details [data-product-attribute="swatch"] .form-option').each(function(){
                var id= $(this).attr('data-product-attribute-value');
                var numbers = Math.floor((Math.random() * 10) + 1);
                color = color.replace('for="attribute_swatch', 'for="'+numbers+'_attribute_swatch');
            }); 

            if ($('.themevaleCompareColor .compareColor-swatch [data-product-option-change5]').length <=0) {
                $('.themevaleCompareColor .compareColor-swatch').append('<div data-product-option-change5=""><div id="sortable" class="form-field color" data-product-attribute="swatch">'+color+'</div></div>');
            }

            $('.themevaleCompareColor [data-product-attribute="swatch"] .form-radio').each(function(){
                if ($(this).is(':checked')) {
                    $(this).prop("checked", false);
                } 
            });
            jQuery(document).on('click', '.modal-background',  function(e){
                $('.themevaleCompareColor .compareColor-swatch [data-product-option-change5]').remove();
                $('#color-swatch-image .item').remove();
            });
        });

        jQuery(document).on('click', '.compareColor-swatch .form-option',  function(e){
            $(this).toggleClass('show');
            var id= $(this).data('product-attribute-value');
            var title = $(this).find('.form-option-variant').attr('title');

            if ($(this).hasClass('show')) {
                if ($(this).find('.form-option-variant[data-img-src]').length) {
                    var img = $(this).find('.form-option-variant').data('img-src');
                    $('.themevaleCompareColor .color-swatch-image').append('<div class="item item-'+id+'"><img src="'+img+'" alt=""><span class="title">'+title+'</span></div>');
                } else {
                    var color = $(this).find('.form-option-variant').data('color');
                    var color_1 = '';
                    var color_2 = '';

                    if ($(this).find('.form-option-variant').hasClass('three-colors')) {
                        color_1 = $(this).find('.form-option-variant:nth-child(2)').data('color-1');
                        color_2 = $(this).find('.form-option-variant:last-child').data('color-2');
                        $('.themevaleCompareColor .color-swatch-image').append('<div class="item item-color item-'+id+'"><div class="color three-colors '+ title +'"><span class="color-0" style="background:'+color+';"></span><span class="color-1" style="background:'+color_1+';"></span><span class="color-2" style="background:'+color_2+';"></span></div><span class="title">'+title+'</span></div>');
                    }

                    if ($(this).find('.form-option-variant').hasClass('two-colors')) {
                        color_1 = $(this).find('.form-option-variant:last-child').data('color-1');
                        $('.themevaleCompareColor .color-swatch-image').append('<div class="item item-color item-'+id+'"><div class="color two-colors '+ title +'"><span class="color-0" style="background:'+color+';"></span><span class="color-1" style="background:'+color_1+';"></span></div><span class="title">'+title+'</span></div>');
                    }

                    if ($(this).find('.form-option-variant').hasClass('one-color')) {
                        $('.themevaleCompareColor .color-swatch-image').append('<div class="item item-color item-'+id+'"><div class="color one-color '+ title +'"><span class="color-0" style="background:'+color+';"></span></div><span class="title">'+title+'</span></div>');
                    }
                }
            } else {
                $('.themevaleCompareColor .color-swatch-image .item-'+id+'').remove();
            }

            if ($(window).width() > 1024) {
                var el = document.getElementById('color-swatch-image');
                new Sortable(el, {
                    animation: 150
                });
            }
            
        });

        jQuery(document).on('click', '#compare-color-popup .modal-close',  function(e){
            $('.themevaleCompareColor .compareColor-swatch [data-product-option-change5]').remove();
            $('#color-swatch-image .item').remove();
        });

    }

    /**
     * Sold product
     */

    soldProduct() {
        var numbersProduct_text = this.context.themeSettings.themevale_soldProduct_products;
        var numbersProductList =  JSON.parse("[" + numbersProduct_text + "]"); 
        var numbersProductItem = (Math.floor(Math.random()*numbersProductList.length));

        var numbersHours_text = this.context.themeSettings.themevale_soldProduct_hours;
        var numbersHoursList =  JSON.parse("[" + numbersHours_text + "]");
        var numbersHoursItem = (Math.floor(Math.random()*numbersHoursList.length));
     
        var soldProductText = this.context.themeSettings.themevale_soldProduct_text;
        var soldProductText2 = this.context.themeSettings.themevale_soldProduct_hours_text;
  
        $('.sold-product').html('<svg class="icon" aria-hidden="true"><use xlink:href="#icon-fire"/></svg>' + '<span>' + numbersProductList[numbersProductItem] + " " + soldProductText + " " + numbersHoursList[numbersHoursItem] + " " + soldProductText2 + '</span>');
        $('.sold-product').show();
    }

    viewingProduct() {
        var ViewerText = this.context.themeSettings.themevale_viewingProduct_text;
        var numbersViewer_text = this.context.themeSettings.themevale_viewingProduct_viewer;
        var numbersViewerList =  JSON.parse("[" + numbersViewer_text + "]"); 
        
        setInterval(function() {
            var numbersViewerItem = (Math.floor(Math.random()*numbersViewerList.length));

            $('.viewing-product').html('<svg class="icon" aria-hidden="true"><use xlink:href="#icon-eye"/></svg>' + numbersViewerList[numbersViewerItem] + " " + ViewerText);
            $('.viewing-product').show();
        }, 10000);
  
    }

    progressBarProduct(id) {
        // const productCurrentstock = this.context.product_currentstock;
        const productCurrentstock = Number($('[data-product-id="'+id+'"] span[data-product-stock]').html());
        var i = 1, temp = productCurrentstock;
        for(i; temp > 10; i++) {
            temp = Math.floor(temp / 10);
        }
        $('[data-product-id="'+id+'"] .progress-meter').css('width', (productCurrentstock/Math.pow(10, i))*100 + '%');
    }

    progressBarProduct2() {
        if ($(".productView-progress-edit").length) {
            var min = Number(this.context.themeSettings.themevale_progressProduct_min);
            var max = Number(this.context.themeSettings.themevale_progressProduct_max);
            var productStock = Math.floor(Math.random() * (max - min + 1)) + min;
            $('.productView-progress-edit span[data-product-stock-2]').append(productStock);
            $('.productView-progress-edit .progress-meter').css('width', (productStock/max)*100 + '%');
        }
    }


    productThumbnailScroll() {
        $('.vertical-thumbnail-sticky .productView-thumbnail-link').on('click', function() {
            event.preventDefault();
            var data = $(this).attr('data-scroll');
            $('html,body').animate({
                scrollTop: $('.vertical-thumbnail-sticky .productView-image[data-scroll="'+data+'"]').offset().top
            }, 1000);
            
        });
    }

    productSticky() {
        if ($('.vertical-thumbnail-sticky').length) {
            var stickythumbnail = new StickySidebar('.vertical-thumbnail-sticky .productView-for', {
                topSpacing: 50,
                bottomSpacing: 0,
                containerSelector: '.themevale_productView-images',
                resizeSensor: true,
                stickyClass: 'is-affixed',
                minWidth: 0
            });

            var stickydetail = new StickySidebar('.themevale_productView-right', {
                topSpacing: 50,
                bottomSpacing: 0,
                containerSelector: '.themevale_productView.style-3',
                resizeSensor: true,
                stickyClass: 'is-affixed',
                minWidth: 0
            });

            if ($(window).width() >= 768) {
                setTimeout(function(){ 
                    stickythumbnail.updateSticky();
                    stickydetail.updateSticky(); 
                }, 300);

                $('.tabs-vertical .toggleLink').on('click', function() {
                    stickydetail.updateSticky();
                });

                $('.vertical-thumbnail-sticky .showmore a').on('click', function() {
                    $('.productView-image-wrapper .productView-image[data-fancybox="images"] a').click();
                });
                
            } else {
                stickythumbnail.destroy();
                stickydetail.destroy();
            }

            $(window).resize(function() {
                if ($(window).width() >= 768) {
                    setTimeout(function(){ 
                        stickythumbnail.updateSticky();
                        stickydetail.updateSticky(); 
                    }, 300);
                } else {
                    stickythumbnail.destroy();
                    stickydetail.destroy();
                }
            });
        }

        // if ($('.themevale_productView-sticky').length) {
        //     var stickyProductImage = new StickySidebar('.themevale_productView-left', {
        //         topSpacing: 50,
        //         bottomSpacing: 0,
        //         containerSelector: '.themevale_productView-sticky',
        //         resizeSensor: true,
        //         stickyClass: 'is-affixed',
        //         minWidth: 0
        //     });

        //     if ($(window).width() >= 768) {
        //         setTimeout(function(){ 
        //             stickyProductImage.updateSticky();
        //         }, 300);

        //         $('.tabs-vertical .toggleLink').on('click', function() {
        //             stickyProductImage.updateSticky();
        //         });
                
        //     } else {
        //         stickyProductImage.destroy();
        //     }

        //     $(window).resize(function() {
        //         if ($(window).width() >= 768) {
        //             setTimeout(function(){ 
        //                 stickyProductImage.updateSticky();
        //             }, 300);
        //         } else {
        //             stickyProductImage.destroy();
        //         }
        //     });
        // }
    }
}
