import $ from 'jquery';
import './common/select-option-plugin';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import compareProducts from './global/compare-products';
import privacyCookieNotification from './global/cookieNotification';
import maintenanceMode from './global/maintenanceMode';
import carousel from './common/carousel';
import 'lazysizes';
import sweetAlert from './global/sweet-alert';
import svgInjector from './global/svg-injector';

/*=========================================
=            www.themevale.com            =
=========================================*/

import themevale_Global from './themevale/themevale_Global';
import themevale_AddToCart from './themevale/themevale_AddToCart';
import themevale_AddOption from './themevale/themevale_AddOptionForProduct';
import themevale_RecentlyBought from './themevale/themevale_RecentlyBought';
import themevale_Sticky from './themevale/themevale_StickyNavigation';
    window.themevale_Sticky = themevale_Sticky;
import themevaleMenu from './themevale/themevale_MegaMenu';
    window.themevaleMenu = themevaleMenu;
import themevaleNewsletterPopup from './themevale/themevale_NewsletterPopup';
    window.themevaleNewsletterPopup = themevaleNewsletterPopup;
/*=====  End of www.themevale.com  ======*/
import FindYourTerritoryManager from './themevale/fytm';

export default class Global extends PageManager {
    onReady() {
        // Only load visible elements until the onload event fires,
        // after which preload nearby elements.
        window.lazySizesConfig = window.lazySizesConfig || {};
        window.lazySizesConfig.loadMode = 1;
        

        quickSearch();
        currencySelector();
        foundation($(document));
        quickView(this.context);
        cartPreview(this.context);
        compareProducts(this.context.urls);
        carousel();
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        maintenanceMode(this.context.maintenanceMode);
        sweetAlert();
        svgInjector();

        themevale_Global();
        themevale_AddToCart();
        themevale_RecentlyBought(this.context);
        themevale_AddOption(this.context);

        if (this.context.themeSettings.find_your_territory_manager_enable == true) {
            FindYourTerritoryManager();
        }
    }
}
