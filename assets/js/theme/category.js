import $ from 'jquery';
import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import Pace from 'pace';
import FacetedSearch from './common/faceted-search';
import themevale_AddOption from './themevale/themevale_AddOptionForProduct';

export default class Category extends CatalogPage {
    onReady() {
        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        this.showmore_product();
        if ($('.card-variant').length) {
            $('.card-variant').each((index, element) => {
                var $prodWrapId = $(element).attr('id');
                if ($prodWrapId != '') {
                    themevale_AddOption(this.context, $prodWrapId);
                }
            });
        }
    }

    initFacetedSearch() {
        const $productListingContainer = $('#product-listing-container .product-listing');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);
            this.showmore_product();

            $('html, body').animate({
                scrollTop: 0,
            }, 100);

            if ($('#product-listing-container .card-variant').length) {
                var $prodWrapId = $('#product-listing-container .card-variant').attr('id');
                themevale_AddOption(this.context, $prodWrapId);
            }
        });
    }

    showmore_product() {
        const context = this.context;
        var check_link = $(".pagination-item--current").next();
        if (check_link.length === 0) {
            $('#button-showmore-category').addClass('disable');
        } else {
            $(document).on('click', '#button-showmore-category', function(e){
                e.preventDefault();
                var nextPage = $(".pagination-item--current").next(),
                    link = nextPage.find("a").attr("href");
                $('#button-showmore-category').addClass('loadding');
                $.ajax({
                    type: 'get',
                    url: link.replace("http://", "//"),
                    context: this.content,
                    success: function(data) {
                        if ($(data).find('#productLayout').length > 0) {
                            $('#productLayout').append($(data).find('#productLayout').children());
                            $('.pagination-list').html($(data).find(".pagination-list").html());
                            $('#button-showmore-category').removeClass('loadding');
                            nextPage = $(".pagination-item--current").next();
                            if (nextPage.length === 0) {
                                $('#button-showmore-category').addClass('disable');
                            }
                            var $prodWrapId = $('#product-listing-container .card-variant').attr('id');
                            themevale_AddOption(context, $prodWrapId);
                        }
                    }
                })
            })
        }
    }
}
