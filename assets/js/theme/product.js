/*
 Import all product specific js
 */
import $ from 'jquery';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';
import Countdown from './themevale/themevale_Countdown';
import FBT from './themevale/themevale_fbt';
import stickyAddToCart from './themevale/themevale_stickyAddToCart';
import themevale_AddOption from './themevale/themevale_AddOptionForProduct';


export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
    }

    onReady() {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        // countdown time
        var product_id = $('[data-cart-item-add] [name="product_id"]').val();
        Countdown(product_id);

        // this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        // this.productDetails.setProductVariant();

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();
        // stickyAddToCart();
        FBT(this.context);

        if ($('.card-variant').length) {
            $('.card-variant').each((index, element) => {
                var $prodWrapId = $(element).attr('id');
                if ($prodWrapId != '') {
                    themevale_AddOption(this.context, $prodWrapId);
                }
            });
        }
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }
}
