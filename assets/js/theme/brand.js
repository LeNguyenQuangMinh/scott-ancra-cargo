import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import $ from 'jquery';
import FacetedSearch from './common/faceted-search';
import themevale_AddOption from './themevale/themevale_AddOptionForProduct';

export default class Brand extends CatalogPage {
    onReady() {
        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        // Product Options
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
        const productsPerPage = this.context.brandProductsPerPage;
        const requestOptions = {
            template: {
                productListing: 'brand/product-listing',
                sidebar: 'brand/sidebar',
            },
            config: {
                shop_by_brand: true,
                brand: {
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            showMore: 'brand/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        });

        // Product Options
        if ($('#product-listing-container .card-variant').length) {
            var $prodWrapId = $('#product-listing-container .card-variant').attr('id');
            if ($prodWrapId != '') {
                themevale_AddOption(this.context, $prodWrapId);
            }
        }
    }
}
