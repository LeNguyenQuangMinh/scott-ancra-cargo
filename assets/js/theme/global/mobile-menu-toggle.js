import $ from 'jquery';
import _ from 'lodash';
import mediaQueryListFactory from '../common/media-query-list';

const PLUGIN_KEY = {
    CAMEL: 'mobileMenuToggle',
    SNAKE: 'mobile-menu-toggle',
};

function optionsFromData($element) {
    const mobileMenuId = $element.data(PLUGIN_KEY.CAMEL);

    return {
        menuSelector: mobileMenuId && `#${mobileMenuId}`,
    };
}

/*
 * Manage the behaviour of a mobile menu
 * @param {jQuery} $toggle
 * @param {Object} [options]
 * @param {Object} [options.headerSelector]
 * @param {Object} [options.menuSelector]
 * @param {Object} [options.scrollViewSelector]
 */
export class MobileMenuToggle {
    constructor($toggle, {
        headerSelector = '.header',
        menuSelector = '#menu',
        scrollViewSelector = '.navPages',
    } = {}) {
        this.$body = $('body');
        this.$menu = $(menuSelector);
        this.$navList = $('.navPages-list-depth-max');
        this.$header = $(headerSelector);
        this.$scrollView = $(scrollViewSelector, this.$menu);
        this.$subMenus = this.$navList.find('.navPages-action');
        this.$subMenus_click = this.$navList.find('.navPages-action > .navPages-action-moreIcon');
        this.$toggle = $toggle;
        this.mediumMediaQueryList = mediaQueryListFactory('medium');

        // Auto-bind
        this.onToggleClick = this.onToggleClick.bind(this);
        this.onMediumMediaQueryMatch = this.onMediumMediaQueryMatch.bind(this);
        this.onSubMenuClick = this.onSubMenuClick.bind(this);

        // Listen
        this.bindEvents();

        // Assign DOM attributes
        this.$toggle.attr('aria-controls', this.$menu.attr('id'));

        // Hide by default
        this.hide();
    }

    get isOpen() {
        return this.$menu.hasClass('is-open');
    }

    bindEvents() {
        this.$toggle.on('click', this.onToggleClick);
        this.$subMenus_click.on('click', this.onSubMenuClick);
        if (this.mediumMediaQueryList && this.mediumMediaQueryList.addListener) {
            this.mediumMediaQueryList.addListener(this.onMediumMediaQueryMatch);
        }

        // close menu mobile
        $('#menu-mobile .themevale_close').on('click', function(){
            $('.mobileMenu-toggle').trigger('click');
            $('body').removeClass('has-activeNavPages');
            $('.mobileMenu-toggle')
                .removeClass('is-open')
                .attr('aria-expanded', false);
        });

        $('.themevale_background').on('click', function() {
            if ($('body').hasClass('has-activeNavPages')) {
                $('.mobileMenu-toggle').trigger('click');
                $('body').removeClass('has-activeNavPages');
                $('.mobileMenu-toggle')
                    .removeClass('is-open')
                    .attr('aria-expanded', false);
            }
        });

        $('.navPages-list--user .currencies #currency_selector >.navPages-action-moreIcon').on('click', function(ev){
            const $closestActionParent = $(event.target).parent().parent();
            const $parentSiblings = $closestActionParent.siblings();
            const $closestActionLevel = $closestActionParent.data('level');
            const $beforeMenuHeight = $('.navPages-list--user').height();
            const $currentmenuHeight = $parentSiblings.height();
            $closestActionParent.addClass('is-open');
            $parentSiblings.addClass('is-hidden');
            $('.navPages-list--user').attr('data-level-list', $closestActionLevel);
            $('.navPages-list--user').attr('data-before',$beforeMenuHeight);
            $('.navPages-list--user').css('min-height',$currentmenuHeight);
        });
        $('.navPages-list--user .currencies .navPage-subMenu-title .navPages-action-moreIcon').on('click', function(ev){
            const $closestAction = $(event.target).closest('.currencies');
            const $parentSiblings = $closestAction.siblings();
            const $beforeMenuHeight = $('.navPages-list--user').data('before');
            $closestAction.removeClass('is-open');
            $parentSiblings.removeClass('is-hidden');
            $('.navPages-list--user').attr('data-level-list', 1);
            $('.navPages-list--user').css('min-height',$beforeMenuHeight);
        });

        
    }

    unbindEvents() {
        this.$toggle.off('click', this.onToggleClick);

        if (this.mediumMediaQueryList && this.mediumMediaQueryList.addListener) {
            this.mediumMediaQueryList.removeListener(this.onMediumMediaQueryMatch);
        }
    }

    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.$body.addClass('has-activeNavPages');

        this.$toggle
            .addClass('is-open')
            .attr('aria-expanded', true);

        this.$menu
            .addClass('is-open')
            .attr('aria-hidden', false);

        this.$header.addClass('is-open');
        this.$scrollView.scrollTop(0);

        this.resetSubMenus();
    }

    hide() {
        this.$body.removeClass('has-activeNavPages');

        this.$toggle
            .removeClass('is-open')
            .attr('aria-expanded', false);

        this.$menu
            .removeClass('is-open')
            .attr('aria-hidden', true);

        this.$header.removeClass('is-open');

        this.resetSubMenus();
    }

    // Private
    onToggleClick(event) {
        event.preventDefault();
        this.toggle();
    }

    onMediumMediaQueryMatch(media) {
        if (!media.matches) {
            return;
        }

        this.hide();
    }

    onSubMenuClick(event) {
        event.preventDefault();

        const $closestAction = $(event.target).parent();
        const $closestActionParent = $closestAction.parent();
        const $parentSiblings = $closestActionParent.siblings();
        const $parentAction = $closestActionParent.closest('.navPage-subMenu').siblings('.navPages-action');
        const $closestActionLevel = $closestActionParent.data('level');
        const $parentActionSubMenu = $closestActionParent.parent();
        this.$navList.attr('data-level-list', $closestActionLevel);
        

        if (!$closestActionParent.hasClass('navPage-subMenu-title')) {
            var $beforeMenuHeight = this.$navList.height();
            var $currentMenuHeight = $closestAction.siblings('.navPage-subMenu').height();
            $closestAction.siblings('.navPage-subMenu').attr('data-before',$beforeMenuHeight);
            $closestAction.siblings('.navPage-subMenu').attr('data-current',$currentMenuHeight);

            if (!$closestActionParent.hasClass('navPages-action-end')) {
                $closestActionParent.toggleClass('is-open');
                $closestAction.toggleClass('is-open');
            }

            if (this.$subMenus.hasClass('is-open')) {
                this.$navList.addClass('subMenu-is-open');
                
            } else {
                this.$subMenus.addClass('is-open');
                this.$navList.removeClass('subMenu-is-open');
            }

            if ($closestAction.hasClass('is-open')) {
                $parentSiblings.addClass('is-hidden');
            }

            $closestAction.closest('.cateArea').siblings('.imageArea.colRight').addClass('is-hidden');
            $closestAction.closest('.cateArea').parent().siblings('.bottomMegamenu').addClass('is-hidden');

            var $imageTopHeight = 0;       

            if ($closestAction.siblings('.imageTop-item').length) {
                $imageTopHeight = $closestAction.siblings('.imageTop-item').height();
            }
            if ($closestAction.siblings('.navPage-subMenu').find('.imageTop-item').length) {
                $imageTopHeight = $closestAction.siblings('.navPage-subMenu').find('.imageTop-item').height();
            }
            if ($closestAction.siblings('.imageTop-item').length || $closestAction.siblings('.navPage-subMenu').find('.imageTop-item').length) {
                $currentMenuHeight = $currentMenuHeight + $imageTopHeight + 40;
            }
            
            this.$navList.css('min-height',$currentMenuHeight);

        } else {
            const $closestAction2 = $(event.target).closest('.navPage-subMenu');
            const $parentSiblings2 = $closestAction2.parent();
            const $parentAction2 = $parentSiblings2.siblings();
            const $closestAction = $parentSiblings2.find('.navPages-action');
            const $closestActionLevel = parseInt($(event.target).parent().parent().data('level')) - 1;
            const $parentActionSubMenu = $closestActionParent.parent();
            var $navListHeight = $closestAction2.data('before');
            const $imageRight = $(event.target).closest('.cateArea').siblings('.imageArea.colRight');
            const $bottomCate = $closestAction.closest('.cateArea').parent().siblings('.bottomCate');
            this.$navList.attr('data-level-list', $closestActionLevel);

            if (this.$subMenus.hasClass('is-open')) {
                this.$subMenus.removeClass('is-open');
                this.$navList.removeClass('subMenu-is-open');
            } else {
                this.$navList.addClass('subMenu-is-open');
            }

            $closestAction.removeClass('is-open');
            $parentSiblings2.removeClass('is-open');
            $parentAction2.removeClass('is-hidden');
            $imageRight.removeClass('is-hidden');
            $bottomCate.removeClass('is-hidden');
            this.$navList.css('min-height',$navListHeight);
        }
    }

    resetSubMenus() {
        this.$navList.find('.is-hidden').removeClass('is-hidden');
        this.$navList.find('.is-open').removeClass('is-open');
        this.$navList.removeClass('subMenu-is-open');
        this.$navList.attr('data-level-list', 1);
        $('.navPages-list--user').attr('data-level-list', 1);
        this.$navList.css('min-height', 'unset');
        $('.navPages-list--user .currencies').removeClass('is-open');
        $('.navPages-list--user .navPages-item').removeClass('is-hidden');
    }
}

/*
 * Create a new MobileMenuToggle instance
 * @param {string} [selector]
 * @param {Object} [options]
 * @param {Object} [options.headerSelector]
 * @param {Object} [options.menuSelector]
 * @param {Object} [options.scrollViewSelector]
 * @return {MobileMenuToggle}
 */
export default function mobileMenuToggleFactory(selector = `[data-${PLUGIN_KEY.SNAKE}]`, overrideOptions = {}) {
    const $toggle = $(selector).eq(0);
    const instanceKey = `${PLUGIN_KEY.CAMEL}Instance`;
    const cachedMobileMenu = $toggle.data(instanceKey);

    if (cachedMobileMenu instanceof MobileMenuToggle) {
        return cachedMobileMenu;
    }

    const options = _.extend(optionsFromData($toggle), overrideOptions);
    const mobileMenu = new MobileMenuToggle($toggle, options);

    $toggle.data(instanceKey, mobileMenu);

    return mobileMenu;
}
