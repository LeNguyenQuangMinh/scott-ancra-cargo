import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import 'jquery-mousewheel';
import 'mCustomScrollbar';
import { defaultModal, showAlertModal } from './modal';
import swal from 'sweetalert2';
import _ from 'lodash';
import Cart from '../cart';
import QuickEditCart from '../themevale/themevale_QuickEditCart';

export const CartPreviewEvents = {
    close: 'closed.fndtn.dropdown',
    open: 'opened.fndtn.dropdown',
};

export default function (context) {
    const loadingClass = 'is-loading';
    const $cart = $('[data-cart-preview]');
    const $cartDropdown = $('.dropdown-cart');
    const $cartLoading = $('<div class="loadingOverlay"></div>');
    const $body = $('body');

    $('body').on('cart-quantity-update', (event, quantity) => {
        $('.cart-quantity')
            .text(quantity)
            .toggleClass('countPill--positive', quantity > 0);
    });
   

    if (!$('body').hasClass('page-type-cart')) {
        QuickEditCart(context);
        $cart.on('click', function(event) {
            event.preventDefault();
            if(context.themeSettings.header_layout_2 == true) {
                var options = {
                    template: 'common/cart-preview-2',
                };
            } else {
                var options = {
                    template: 'common/cart-preview',
                };
            }

            // Redirect to full cart page
            //
            // https://developer.mozilla.org/en-US/docs/Browser_detection_using_the_user_agent
            // In summary, we recommend looking for the string 'Mobi' anywhere in the User Agent to detect a mobile device.
            // if (/Mobi/i.test(navigator.userAgent)) {
            //     return event.stopPropagation();
            // }

            $(this).parent().toggleClass('is-open');

            $cartDropdown
                .addClass(loadingClass)
                .html($cartLoading);
            $cartLoading
                .show();

            utils.api.cart.getContent(options, (err, response) => {
                $cartDropdown
                    .removeClass(loadingClass)
                    .html(response);

                const $previewCartList = $('.previewCartList');
                $previewCartList.mCustomScrollbar('destroy');
                if ($previewCartList.length) {
                    $previewCartList.mCustomScrollbar({
                        scrollInertia: 400,
                    });
                }
            });
        });
        if ($(window).width() > 1024) {
            // If not devide 2 case as below, when click on the Remove Confirm popup or Edit Cart popup, the Dropdown Cart will close
            $('.header').on('click', function(event) {
                if ($cart.parent().hasClass('is-open')) {
                    if ($(event.target).closest('.themevale_cart > .navUser-action').length === 0 && $(event.target).closest('.themevale_cart .dropdown-cart').length === 0) {
                        $cart.parent().removeClass('is-open');
                    }
                }
            });
            $('.body').on('click', function(event) {
                if ($cart.parent().hasClass('is-open')) {
                    if ($(event.target).closest('.themevale_cart > .navUser-action').length === 0 && $(event.target).closest('.themevale_cart .dropdown-cart').length === 0) {
                        $cart.parent().removeClass('is-open');
                    }
                }
            });
        }

        // BEGIN EDIT DROPDOWN CART
        function refreshContent(remove) {
            if(context.themeSettings.header_layout_2 == true) {
                var options = {
                    template: 'common/cart-preview-2',
                };
            } else {
                var options = {
                    template: 'common/cart-preview',
                };
            }

            $cartDropdown
                .addClass(loadingClass)
                .prepend($cartLoading);
            $cartLoading
                .show();
     
            utils.api.cart.getContent(options, (err, response) => {
                $cartDropdown
                    .removeClass(loadingClass)
                    .html(response);

                const $previewCartList = $('.previewCartList');
                $previewCartList.mCustomScrollbar('destroy');
                if ($previewCartList.length) {
                    $previewCartList.mCustomScrollbar({
                        scrollInertia: 400,
                    });
                }

                const quantity = $('[data-cart-quantity]').data('cartQuantity') || 0;

                $('body').trigger('cart-quantity-update', quantity);
            });
        }

        // Cart Remove
        $(document).on('click','.previewCart .cart-remove', (event) => {
            const itemId = $(event.currentTarget).data('cartItemid');
            const string = $(event.currentTarget).data('confirmDelete');
            swal({
                text: string,
                type: 'warning',
                showCancelButton: true,
            }).then(() => {
                // remove item from cart
                cartRemoveItem(itemId);
            });
            event.preventDefault();
        });

        function cartRemoveItem(itemId) {
            utils.api.cart.itemRemove(itemId, (err, response) => {
                if (response.data.status === 'succeed') {
                    refreshContent(true);
                } else {
                    alert(response.data.errors.join('\n'));
                }
            });
        }

        // Cart update
        $(document).on('click','[data-cart-update]', (event) => {
            const $target = $(event.currentTarget);
            event.preventDefault();

            // update cart quantity
            cartUpdate($target);
        });

        function cartUpdate($target) {
            const itemId = $target.data('cart-itemid');
            const $el = $(`#qty-${itemId}`);
            const oldQty = parseInt($el.val(), 10);
            const maxQty = parseInt($el.data('quantityMax'), 10);
            const minQty = parseInt($el.data('quantityMin'), 10);
            const minError = $el.data('quantityMinError');
            const maxError = $el.data('quantityMaxError');
            const newQty = $target.data('action') === 'inc' ? oldQty + 1 : oldQty - 1;
            let invalidEntry;

            // Does not quality for min/max quantity
            if (!newQty) {
                invalidEntry = newQty;
                $el.val(oldQty);
                return swal({
                    text: `${invalidEntry} is not a valid entry`,
                    icon: 'error',
                });
            } else if (newQty < minQty) {
                return swal({
                    text: minError,
                    icon: 'error',
                });
            } else if (maxQty > 0 && newQty > maxQty) {
                return swal({
                    text: maxError,
                    icon: 'error',
                });
            } else {
                utils.api.cart.itemUpdate(itemId, newQty, (err, response) => {
                    if (response.data.status === 'succeed') {
                        // if the quantity is changed "1" from "0", we have to remove the row.
                        const remove = (newQty === 0);

                        refreshContent(remove);
                    } else {
                        $el.val(oldQty);
                        swal({
                            text: response.data.errors.join('\n'),
                            icon: 'error',
                        });
                    }
                });
            }        
        }

        // cart qty manually updates
        $(document).on('focus','.previewCart .cart-item-qty-input', (event) => {
            const $target = $(event.currentTarget);
            $target.data('preVal', $target.val());
        });    
        
        $(document).on('change','.previewCart .cart-item-qty-input', (event) => {
            const $target = $(event.currentTarget);
            var preVal= $target.data('preVal');
            event.preventDefault();
            cartUpdateQtyTextChange($target, preVal);
        });

        function cartUpdateQtyTextChange($target, preVal = null) {
            const itemId = $target.data('cart-itemid');
            const $el = $(`#qty-${itemId}`);
            const maxQty = parseInt($el.data('quantityMax'), 10);
            const minQty = parseInt($el.data('quantityMin'), 10);
            const oldQty = preVal !== null ? preVal : minQty;
            const minError = $el.data('quantityMinError');
            const maxError = $el.data('quantityMaxError');
            const newQty = $target.val();
            let invalidEntry;

            // Does not quality for min/max quantity
            if (!newQty) {
                invalidEntry = $el.val();
                $el.val(oldQty);
                return swal({
                    text: `${invalidEntry} is not a valid entry`,
                    icon: 'error',
                });
            } else if (newQty < minQty) {
                $el.val(oldQty);
                return swal({
                    text: minError,
                    icon: 'error',
                });
            } else if (maxQty > 0 && newQty > maxQty) {
                $el.val(oldQty);
                return swal({
                    text: maxError,
                    icon: 'error',
                });
            } else {
                utils.api.cart.itemUpdate(itemId, newQty, (err, response) => {
                    if (response.data.status === 'succeed') {
                        // if the quantity is changed "1" from "0", we have to remove the row.
                        const remove = (newQty === 0);
                        refreshContent(remove);
                    } else {
                        $el.val(oldQty);
                        swal({
                            text: response.data.errors.join('\n'),
                            icon: 'error',
                        });
                    }
                });  
            }
        }
        // // END EDIT DROPDOWN CART
    }
}
