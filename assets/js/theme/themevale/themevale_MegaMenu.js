import utils from '@bigcommerce/stencil-utils';

export default class themevaleMenu
{
    constructor() {
    }

    menuItem(num) {
        if ($('.themevale_allCategories-dropdown').length) {
            return {
                themevaleMegaMenu(param) {
                    // Defaut params
                    param = $.extend({
                    style: '',
                    dropAlign: 'left',
                    dropWidth: '493px',
                    dropType: 'imageLeft',
                    cateColumns: 1,
                    bottomMegamenu: 'none',
                    disabled: false,
                    bottomCates: '',
                    imagesTop: '',
                    label: '',
                    }, param);

                    $('.navPages > ul.navPages-list:not(.navPages-list--user) > li:not(.navPages-item-hidden):nth-of-type(' + num + ')').each(function(idx, el) {
                        if (param.disabled === false) {
                            const subMegaMenu = $(el).children('.navPage-subMenu');
                            const navPages_action = $(el).children('.navPages-action').children('.text');

                            $(el).addClass('hasMegamenu');
                            subMegaMenu.removeClass('subMenu').addClass('navPage-subMegaMenu');

                            // label: New, Sale, Hot
                            if (param.label === 'new') {
                                if (!navPages_action.find('.new-label').length) {
                                    navPages_action.append('<span class="navPages-label new-label">New</span>');
                                }
                            } else if (param.label === 'sale') {
                                if (!navPages_action.find('.sale-label').length) {
                                    navPages_action.append('<span class="navPages-label sale-label">Sale</span>');
                                }
                            } else if (param.label === 'hot') {
                                if (!navPages_action.find('.hot-label').length) {
                                    navPages_action.append('<span class="navPages-label hot-label">Hot</span>');
                                }
                            }

                            // dropdown Alignment
                            if (param.dropAlign === 'fullWidth') {
                                $(el).addClass('fullWidth');
                            } else if (param.dropAlign === 'center') {
                                $(el).addClass('alignCenter');
                            } else if (param.dropAlign === 'right') {
                                $(el).addClass('alignRight');
                            } else if (param.dropAlign == 'left-edge') {
                                $(el).addClass('alignLeftEdge');
                            }  else {
                                $(el).addClass('alignLeft');
                            }

                            // dropdown Type
                            if (param.dropType === 'imageLeft') {
                                subMegaMenu.addClass('imageLeft');
                                if (!subMegaMenu.find('.cateArea.colRight').length) {
                                    subMegaMenu.wrapInner('<div class="cateArea colRight"></div>');
                                }
                                if (!subMegaMenu.find('.imageArea.colLeft').length) {
                                    subMegaMenu.append('<div class="imageArea colLeft">' + param.images + '</div>');
                                }
                            } else if (param.dropType === 'imageRight') {
                                subMegaMenu.addClass('imageRight');
                                if (!subMegaMenu.find('.cateArea.colLeft').length) {
                                    subMegaMenu.wrapInner('<div class="cateArea colLeft"></div>');
                                }
                                if (!subMegaMenu.find('.imageArea.colRight').length) {
                                    subMegaMenu.append('<div class="imageArea colRight">' + param.images + '</div>');
                                }
                            } else if (param.dropType === 'noImage') {
                                if (!subMegaMenu.find('.cateArea').length) {
                                    subMegaMenu.addClass('noImage').wrapInner('<div class="cateArea"></div>');
                                }
                            } else if (param.dropType === 'imageTop') {
                                if (!subMegaMenu.find('.cateArea').length) {
                                    subMegaMenu.addClass('imageTop').wrapInner('<div class="cateArea"></div>');
                                }
                            }

                            // dropdown Width
                            if ((param.dropAlign === 'fullWidth')) {
                                if (!subMegaMenu.children('.container').length) {
                                    subMegaMenu.wrapInner('<div class="container"></div>');
                                }
                                subMegaMenu.css({
                                    'width': '100%'
                                });
                            } else {
                                subMegaMenu.css({
                                    'width': param.dropWidth
                                });
                            }

                            // cateColumns
                            if (param.cateColumns === 2) {
                                subMegaMenu.find('.cateArea').addClass('columns-2');
                            } else if (param.cateColumns === 3) {
                                subMegaMenu.find('.cateArea').addClass('columns-3');
                            } else if (param.cateColumns === 4) {
                                subMegaMenu.find('.cateArea').addClass('columns-4');
                            } else if (param.cateColumns === 5) {
                                subMegaMenu.find('.cateArea').addClass('columns-5');
                            } else if (param.cateColumns === 6) {
                                subMegaMenu.find('.cateArea').addClass('columns-6');
                            }

                            // imageAreaWidth
                            subMegaMenu.find('.imageArea').css({
                                'width': '100%',
                                'max-width': param.imageAreaWidth
                            });

                            // cateAreaWidth
                            subMegaMenu.find('.cateArea').css({
                                'width': '100%',
                                'max-width': param.cateAreaWidth
                            });

                            if (param.bottomCates.length && (param.bottomCates !== '')) {
                                subMegaMenu.find('.cateArea').addClass('has-bottom-cates');
                                if (!subMegaMenu.find('.cateArea > ul .bottomCate').length) {
                                    subMegaMenu.find('.cateArea > ul').append('<div class="bottomCate" style="max-width: ' + param.cateAreaWidth + '">' + param.bottomCates + '</div>');
                                }
                            }

                            if (param.imagesTop.length && (param.imagesTop !== '')) {
                                function megamenuImageTop($_image_array) {
                                    var j = 2;
                                    for (var i = 0, len = $_image_array.length; i < len; i++) {
                                        j = j + 1;
                                        if (!subMegaMenu.find('.cateArea > ul > li:nth-child(' + j + ') .imageTop-item').length) {
                                            subMegaMenu.find('.cateArea > ul > li:nth-child(' + j + ') > .navPages-action').after($_image_array[i]);
                                        }
                                    }
                                }
                                megamenuImageTop(param.imagesTop);
                            }

                            if (param.bottomMegamenu.length && (param.bottomMegamenu !== 'none')) {
                                if (!subMegaMenu.find('.bottomMegamenu').length) {
                                 subMegaMenu.append('<div class="bottomMegamenu">' + param.bottomMegamenu + '</div>');
                                }
                            }

                        } else {
                            const navPages_action = $(el).children('.navPages-action').children('.text');

                            // label: New, Sale, Hot
                            if (param.label === 'new') {
                                if (!navPages_action.find('.new-label').length) {
                                    navPages_action.append('<span class="navPages-label new-label">New</span>');
                                }
                            } else if (param.label === 'sale') {
                                if (!navPages_action.find('.sale-label').length) {
                                    navPages_action.append('<span class="navPages-label sale-label">Sale</span>');
                                }
                            } else if (param.label === 'hot') {
                                if (!navPages_action.find('.hot-label').length) {
                                    navPages_action.append('<span class="navPages-label hot-label">Hot</span>');
                                }
                            }
                        }
                    });
                    $('.themevale_allCategories-dropdown > ul.navPages-list:not(.navPages-list--user) > li:nth-child(' + num + ')').each(function(idx, el) {
                        if (param.disabled === false) {
                            const subMegaMenu = $(el).children('.navPage-subMenu');
                            const navPages_action = $(el).children('.navPages-action').children('.text');

                            $(el).addClass('hasMegamenu');
                            subMegaMenu.removeClass('subMenu').addClass('navPage-subMegaMenu');

                            // dropdown Alignment
                            if (param.dropAlign === 'fullWidth') {
                                $(el).addClass('fullWidth');
                            } else if (param.dropAlign === 'center') {
                                $(el).addClass('alignCenter');
                            } else if (param.dropAlign === 'right') {
                                $(el).addClass('alignRight');
                            } else if (param.dropAlign == 'left-edge') {
                                $(el).addClass('alignLeftEdge');
                            }  else {
                                $(el).addClass('alignLeft');
                            }

                            // dropdown Type
                            if (param.dropType === 'imageLeft') {
                                subMegaMenu.addClass('imageLeft');
                                if (!subMegaMenu.find('.cateArea.colRight').length) {
                                    subMegaMenu.wrapInner('<div class="cateArea colRight"></div>');
                                }
                                if (!subMegaMenu.find('.imageArea.colLeft').length) {
                                    subMegaMenu.append('<div class="imageArea colLeft">' + param.images + '</div>');
                                }
                            } else if (param.dropType === 'imageRight') {
                                subMegaMenu.addClass('imageRight');
                                if (!subMegaMenu.find('.cateArea.colLeft').length) {
                                    subMegaMenu.wrapInner('<div class="cateArea colLeft"></div>');
                                }
                                if (!subMegaMenu.find('.imageArea.colRight').length) {
                                    subMegaMenu.append('<div class="imageArea colRight">' + param.images + '</div>');
                                }
                            } else if (param.dropType === 'noImage') {
                                if (!subMegaMenu.find('.cateArea').length) {
                                    subMegaMenu.addClass('noImage').wrapInner('<div class="cateArea"></div>');
                                }
                            } else if (param.dropType === 'imageTop') {
                                if (!subMegaMenu.find('.cateArea').length) {
                                    subMegaMenu.addClass('imageTop').wrapInner('<div class="cateArea"></div>');
                                }
                            }


                            // dropdown Width
                            if ((param.dropAlign === 'fullWidth')) {
                                if (!subMegaMenu.children('.container').length) {
                                    subMegaMenu.wrapInner('<div class="container"></div>');
                                }
                                subMegaMenu.css({
                                    'width': '100%'
                                });
                            } else {
                                subMegaMenu.css({
                                    'width': param.dropWidth
                                });
                            }

                            // cateColumns
                            if (param.cateColumns === 2) {
                                subMegaMenu.find('.cateArea').addClass('columns-2');
                            } else if (param.cateColumns === 3) {
                                subMegaMenu.find('.cateArea').addClass('columns-3');
                            } else if (param.cateColumns === 4) {
                                subMegaMenu.find('.cateArea').addClass('columns-4');
                            } else if (param.cateColumns === 5) {
                                subMegaMenu.find('.cateArea').addClass('columns-5');
                            } else if (param.cateColumns === 6) {
                                subMegaMenu.find('.cateArea').addClass('columns-6');
                            }

                            // imageAreaWidth
                            subMegaMenu.find('.imageArea').css({
                                'width': '100%',
                                'max-width': param.imageAreaWidth
                            });

                            // cateAreaWidth
                            subMegaMenu.find('.cateArea').css({
                                'width': '100%',
                                'max-width': param.cateAreaWidth
                            });

                            if (param.bottomCates.length && (param.bottomCates !== '')) {
                                subMegaMenu.find('.cateArea').addClass('has-bottom-cates');
                                if (!subMegaMenu.find('.cateArea > ul .bottomCate').length) {
                                    subMegaMenu.find('.cateArea > ul').append('<div class="bottomCate" style="max-width: ' + param.cateAreaWidth + '">' + param.bottomCates + '</div>');
                                }
                            }

                            if (param.imagesTop.length && (param.imagesTop !== '')) {
                                function megamenuImageTop($_image_array) {
                                    var j = 2;
                                    for (var i = 0, len = $_image_array.length; i < len; i++) {
                                        j = j + 1;
                                        if (!subMegaMenu.find('.cateArea > ul > li:nth-child(' + j + ') .imageTop-item').length) {
                                            subMegaMenu.find('.cateArea > ul > li:nth-child(' + j + ') > .navPages-action').after($_image_array[i]);
                                        }
                                    }
                                }
                                megamenuImageTop(param.imagesTop);
                            }

                            if (param.bottomMegamenu.length && (param.bottomMegamenu !== 'none')) {
                                if (!subMegaMenu.find('.bottomMegamenu').length) {
                                 subMegaMenu.append('<div class="bottomMegamenu">' + param.bottomMegamenu + '</div>');
                                } 
                            }
                        } else {
                            const navPages_action = $(el).children('.navPages-action').children('.text');
                        }
                    });
                    return this;
                }
            }
        } else {
            return {
                themevaleMegaMenu(param) {
                    // Defaut params
                    param = $.extend({
                    style: '',
                    dropAlign: 'left',
                    dropWidth: '493px',
                    dropType: 'imageLeft',
                    cateColumns: 1,
                    bottomMegamenu: 'none',
                    disabled: false,
                    bottomCates: '',
                    imagesTop: '',
                    label: '',
                    }, param);

                    $('.navPages > ul.navPages-list:not(.navPages-list--user) > li:nth-child(' + num + ')').each(function(idx, el) {
                        if (param.disabled === false) {
                            const subMegaMenu = $(el).children('.navPage-subMenu');
                            const navPages_action = $(el).children('.navPages-action').children('.text');

                            $(el).addClass('hasMegamenu');
                            subMegaMenu.removeClass('subMenu').addClass('navPage-subMegaMenu');

                            // label: New, Sale, Hot
                            if (param.label === 'new') {
                                if (!navPages_action.find('.new-label').length) {
                                    navPages_action.append('<span class="navPages-label new-label">New</span>');
                                }
                            } else if (param.label === 'sale') {
                                if (!navPages_action.find('.sale-label').length) {
                                    navPages_action.append('<span class="navPages-label sale-label">Sale</span>');
                                }
                            } else if (param.label === 'hot') {
                                if (!navPages_action.find('.hot-label').length) {
                                    navPages_action.append('<span class="navPages-label hot-label">Hot</span>');
                                }
                            }

                            // dropdown Alignment
                            if (param.dropAlign === 'fullWidth') {
                                $(el).addClass('fullWidth');
                            } else if (param.dropAlign === 'center') {
                                $(el).addClass('alignCenter');
                            } else if (param.dropAlign === 'right') {
                                $(el).addClass('alignRight');
                            } else if (param.dropAlign == 'left-edge') {
                                $(el).addClass('alignLeftEdge');
                            }  else {
                                $(el).addClass('alignLeft');
                            }

                            // dropdown Type
                            if (param.dropType === 'imageLeft') {
                                subMegaMenu.addClass('imageLeft');
                                if (!subMegaMenu.find('.cateArea.colRight').length) {
                                    subMegaMenu.wrapInner('<div class="cateArea colRight"></div>');
                                }
                                if (!subMegaMenu.find('.imageArea.colLeft').length) {
                                    subMegaMenu.append('<div class="imageArea colLeft">' + param.images + '</div>');
                                }
                            } else if (param.dropType === 'imageRight') {
                                subMegaMenu.addClass('imageRight');
                                if (!subMegaMenu.find('.cateArea.colLeft').length) {
                                    subMegaMenu.wrapInner('<div class="cateArea colLeft"></div>');
                                }
                                if (!subMegaMenu.find('.imageArea.colRight').length) {
                                    subMegaMenu.append('<div class="imageArea colRight">' + param.images + '</div>');
                                }
                            } else if (param.dropType === 'noImage') {
                                if (!subMegaMenu.find('.cateArea').length) {
                                    subMegaMenu.addClass('noImage').wrapInner('<div class="cateArea"></div>');
                                }
                            } else if (param.dropType === 'imageTop') {
                                if (!subMegaMenu.find('.cateArea').length) {
                                    subMegaMenu.addClass('imageTop').wrapInner('<div class="cateArea"></div>');
                                }
                            }

                            // dropdown Width
                            if ((param.dropAlign === 'fullWidth')) {
                                if (!subMegaMenu.children('.container').length) {
                                    subMegaMenu.wrapInner('<div class="container"></div>');
                                }
                                
                                subMegaMenu.css({
                                    'width': '100%'
                                });
                            } else {
                                subMegaMenu.css({
                                    'width': param.dropWidth
                                });
                            }

                            // cateColumns
                            if (param.cateColumns === 2) {
                                subMegaMenu.find('.cateArea').addClass('columns-2');
                            } else if (param.cateColumns === 3) {
                                subMegaMenu.find('.cateArea').addClass('columns-3');
                            } else if (param.cateColumns === 4) {
                                subMegaMenu.find('.cateArea').addClass('columns-4');
                            } else if (param.cateColumns === 5) {
                                subMegaMenu.find('.cateArea').addClass('columns-5');
                            } else if (param.cateColumns === 6) {
                                subMegaMenu.find('.cateArea').addClass('columns-6');
                            }

                            // imageAreaWidth
                            subMegaMenu.find('.imageArea').css({
                                'width': '100%',
                                'max-width': param.imageAreaWidth
                            });

                            // cateAreaWidth
                            subMegaMenu.find('.cateArea').css({
                                'width': '100%',
                                'max-width': param.cateAreaWidth
                            });

                            if (param.bottomCates.length && (param.bottomCates !== '')) {
                                subMegaMenu.find('.cateArea').addClass('has-bottom-cates');
                                if (!subMegaMenu.find('.cateArea > ul .bottomCate').length) {
                                    subMegaMenu.find('.cateArea > ul').append('<div class="bottomCate" style="max-width: ' + param.cateAreaWidth + '">' + param.bottomCates + '</div>');
                                }
                            }

                            if (param.imagesTop.length && (param.imagesTop !== '')) {
                                function megamenuImageTop($_image_array) {
                                    var j = 2;
                                    for (var i = 0, len = $_image_array.length; i < len; i++) {
                                        j = j + 1;
                                        if (!subMegaMenu.find('.cateArea > ul > li:nth-child(' + j + ') .imageTop-item').length) {
                                            subMegaMenu.find('.cateArea > ul > li:nth-child(' + j + ') > .navPages-action').after($_image_array[i]);
                                        }
                                    }
                                }
                                megamenuImageTop(param.imagesTop);
                            }

                            if (param.bottomMegamenu.length && (param.bottomMegamenu !== 'none')) {
                               if (!subMegaMenu.find('.bottomMegamenu').length) {
                                 subMegaMenu.append('<div class="bottomMegamenu">' + param.bottomMegamenu + '</div>');
                               } 
                                
                            }

                            // Featured Product
                            if(param.style === 'style 4') {
                                var featuredProduct = subMegaMenu.find('.featuredProduct');
                                var featuredProductContent = subMegaMenu.find('.featuredProduct .card');

                                if (featuredProductContent.length <= 0) {
                                    if (param.productId.length && (param.productId !== '')) {
                                        var productId = param.productId;

                                        const $options = {
                                            template: 'themevale/header/megamenu-tmp'
                                        };
                                        if (featuredProduct.length) {
                                            utils.api.product.getById(productId, $options, (err, response) => {
                                                if (featuredProductContent.length <= 0) {
                                                    featuredProduct.append(response);
                                                }
                                                featuredProduct.find('.loadingOverlay').remove();
                                            });
                                        }
                                    }
                                }
                            }

                        } else {
                            const navPages_action = $(el).children('.navPages-action').children('.text');

                            // label: New, Sale, Hot
                            if (param.label === 'new') {
                                navPages_action.append('<span class="navPages-label new-label">New</span>');
                            } else if (param.label === 'sale') {
                                navPages_action.append('<span class="navPages-label sale-label">Sale</span>');
                            } else if (param.label === 'hot') {
                                navPages_action.append('<span class="navPages-label hot-label">Hot</span>');
                            }
                        }
                    });
                    return this;
                }
            }
        }
    }
}
