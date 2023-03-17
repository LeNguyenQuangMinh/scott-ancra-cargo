import $ from 'jquery';
import nod from '../common/nod';
import { CollapsibleEvents } from '../common/collapsible';
import forms from '../common/models/forms';

export default class {
    constructor($reviewForm) {
        this.validator = nod({
            submit: $reviewForm.find('input[type="submit"]'),
        });

        this.$reviewsContent = $('#product-reviews');
        this.$collapsible = $('.productView-reviewTabLink', this.$reviewsContent);
        this.initLinkBind();
        this.injectPaginationLink();
        this.collapseReviews();
    }

    /**
     * On initial page load, the user clicks on "(12 Reviews)" link
     * The browser jumps to the review page and should expand the reviews section
     */
    initLinkBind() {
        const $content = $('#product-reviews', this.$reviewsContent);

        $('.review-link a').on('click', (event) => {
            event.preventDefault();
            
            if (!$('.productView-reviewTabLink').parent().hasClass('is-active')) {
                $('.productView-reviewTabLink').trigger('click');
            }
            if ($(window).width() <= 767) {
                $('#product-reviews > .toggle-title > .toggleLink').addClass('is-open');
                $('#product-reviews #productReviews-content').addClass('is-open');
            }

            $('html, body').animate({
                scrollTop: $('#product-reviews').offset().top - $('.header').height(),
            }, 700);

            if (!$content.hasClass('is-active')) {
                this.$collapsible.trigger(CollapsibleEvents.click);
            }
            
        });
    }

    collapseReviews() {
        // We're in paginating state, do not collapse
        if (window.location.hash && window.location.hash.indexOf('#product-reviews') === 0) {
            const $content = $('#product-reviews', this.$reviewsContent);
            if (!$('.productView-reviewTabLink').parent().hasClass('is-active')) {
                $('.productView-reviewTabLink').trigger('click');
            }
            if ($(window).width() <= 767) {
                $('#product-reviews > .toggle-title > .toggleLink').addClass('is-open');
                $('#product-reviews #productReviews-content').addClass('is-open');
            }
            $('html, body').animate({
                scrollTop: $('#product-reviews').offset().top - $('.header').height(),
            }, 700);

            if (!$content.hasClass('is-active')) {
                this.$collapsible.trigger(CollapsibleEvents.click);
            }
            return;
        }
    }

    /**
     * Inject ID into the pagination link
     */
    injectPaginationLink() {
        const $nextLink = $('.pagination-item--next .pagination-link', this.$reviewsContent);
        const $prevLink = $('.pagination-item--previous .pagination-link', this.$reviewsContent);

        if ($nextLink.length) {
            $nextLink.attr('href', `${$nextLink.attr('href')} #product-reviews`);
        }

        if ($prevLink.length) {
            $prevLink.attr('href', `${$prevLink.attr('href')} #product-reviews`);
        }
    }

    registerValidation(context) {
        this.context = context;
        this.validator.add([{
            selector: '[name="revrating"]',
            validate: 'presence',
            errorMessage: this.context.reviewRating,
        }, {
            selector: '[name="revtitle"]',
            validate: 'presence',
            errorMessage: this.context.reviewSubject,
        }, {
            selector: '[name="revtext"]',
            validate: 'presence',
            errorMessage: this.context.reviewComment,
        }, {
            selector: '[name="email"]',
            validate: (cb, val) => {
                const result = forms.email(val);
                cb(result);
            },
            errorMessage: this.context.reviewEmail,
        }]);

        return this.validator;
    }

    validate() {
        return this.validator.performCheck();
    }
}
