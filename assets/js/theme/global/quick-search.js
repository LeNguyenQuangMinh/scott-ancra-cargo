import $ from 'jquery';
import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import StencilDropDown from './stencil-dropdown';
import Themevale_QuickSearch from './themevale_searchCategories';

export default function () {
    const $quickSearchResults = $('.quickSearchResults');
    const $quickSearchDiv = $('#quickSearch');
    const $searchQuery = $('#search_query');
    const $searchButton = $('[data-search="quickSearch"]');
    const stencilDropDownExtendables = {
        hide: () => {
            $searchQuery.trigger('blur');
        },
        show: (event) => {
            $searchQuery.trigger('focus');
            event.stopPropagation();
        },
    };
    const stencilDropDown = new StencilDropDown(stencilDropDownExtendables);
    stencilDropDown.bind($('[data-search="quickSearch"]'), $quickSearchDiv);

    stencilDropDownExtendables.onBodyClick = (e, $container) => {
        // If the target element has this data tag or one of it's parents, do not close the search results
        // We have to specify `.modal-background` because of limitations around Foundation Reveal not allowing
        // any modification to the background element.
        if ($(e.target).closest('[data-prevent-quick-search-close], #search_query, #search_query_mobile').length === 0) {
            stencilDropDown.hide($container);
            $quickSearchResults.empty();
            $quickSearchResults.removeClass('hasResults');
            $searchButton.removeClass('is-open');
            $('body').removeClass('themevale_quickSearch');
        }

        $('.themevale_background').on('click', function(e) {
            if ($('body').hasClass('themevale_quickSearch')) {
                stencilDropDown.hide($container);
                $quickSearchResults.empty();
                $quickSearchResults.removeClass('hasResults');
                $searchButton.removeClass('is-open');
                $('body').removeClass('themevale_quickSearch');
                $('.themevale_searchSticky').removeClass('is-open');
            }
        });
    };

    // stagger searching for 200ms after last input
    const doSearch = _.debounce((searchQuery, category) => {
        if ($('.themevale_search-custom').length) {
            var quickSearch = new Themevale_QuickSearch;
            quickSearch.search(searchQuery, category, { template: 'search/quick-results' }, (err, response) => {
                if (err) {
                    return false;
                }
                $quickSearchResults.addClass('hasResults');
                $quickSearchResults.html(response);
            });
        } else {
            utils.api.search.search(searchQuery, { template: 'search/quick-results' }, (err, response) => {
                if (err) {
                    return false;
                }
                $quickSearchResults.addClass('hasResults');
                $quickSearchResults.html(response);
            });
        }
    }, 200);

    utils.hooks.on('search-quick', (event) => {
        const searchQuery = $(event.currentTarget).val();
        const category = $(event.currentTarget).parents('form').find('select[name="category"]').val();
        // server will only perform search with at least 3 characters
        if (searchQuery.length < 3) {
            return;
        }
        if ($('.themevale_search-custom').length) {
            doSearch(searchQuery, category);
        } else {
            doSearch(searchQuery);
        }
    });

    // Catch the submission of the quick-search
    $quickSearchDiv.on('submit', event => {
        const searchQuery = $(event.currentTarget).find('input').val();

        if (searchQuery.length === 0) {
            return event.preventDefault();
        }

        return true;
    });

    $searchButton.on('click', event => {
        event.preventDefault();
        $searchButton.addClass('is-open');
        $('body').addClass('themevale_quickSearch');
        $('.themevale_searchSticky').addClass('is-open');
        if ($('.header').hasClass('is-sticky')) {
            $('.themevale_searchSticky').css('top', $('.header').height());
        } else {
            $('.themevale_searchSticky').css('top', $('.header').height() + $('#themevale_top-promotion').outerHeight());
        }
    });

    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i, len;

        for (i = 0, len = sURLVariables.length; i < len; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

    function search_category() {
        var category = getUrlParameter('category');
        $('#search_category').val(category).trigger("change");
        $('select[name="category"]').val(category).trigger("change");

        $(document).on('change', '#search_category .select_category', function() {
           var text_option = $(this).find('option:selected').text();
           var $test_option = $('<span>').html(text_option);
           $test_option.appendTo('body');
           var width_option = $test_option.width() + 62;
           $test_option.remove();
           $(this).parent().css('min-width', width_option);
        })

        $('form[action="/search.php"]').on('submit', (event) => {
            if($(event.currentTarget).find('select[name="category"]').val() === ''){
                $(event.currentTarget).find('select').attr('name','');
            }
        });
    }
    search_category();

    // function searchForm_focus() {
    //     $('#search_query').on('focus', function(){
    //         $('body').addClass('themevale_quickSearch');
    //     });
    // }
    // searchForm_focus();

    $(document).ready(function(){
        var category = getUrlParameter('category');
        $('#search_category').val(category).trigger("change");
        $('select[name="category"]').val(category).trigger("change");       
    });

}
