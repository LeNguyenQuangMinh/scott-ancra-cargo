export default function(context, wrapper) {
    if (context.themeSettings.themevale_AddOptionForProduct == true) {
        const token = context.token,
            product_wrapper = $('#'+wrapper),
            product_class = product_wrapper.find('.card');
        var  list = [];

        function callProductOption() {
            product_class.each(function() {
                var productId = $(this).data("product-id");
                list.push(productId.toString());
            });

            if(list.length > 0){
                getProductOption(list).then(data => {
                    renderOption(data);

                    $.each(list, function(i){
                        var arr = {},
                            productId = list[i];

                        // Color Option    
                        product_wrapper.find('.card_optionImage-'+productId+' .form-option').each(function() {
                            var txt = $(this).data('product-swatch-value');
                            if (arr[txt]){
                               $(this).remove();
                            } else {
                                arr[txt] = true;
                            }
                        });

                        if(product_wrapper.find('.card_optionImage-'+productId+' .form-option').length > 4){
                            var countMoreOption  = product_wrapper.find('.card_optionImage-'+productId+' .form-option').length - 4,
                                productLink = product_wrapper.find('[data-product-id="'+productId+'"]').find('.card-title > a').attr('href');

                            product_wrapper.find('.card_optionImage-'+productId+' .form-option').each(function(i){
                                if(i >= 4){
                                   $(this).remove();
                                }
                            });

                            if (product_wrapper.find('.card_optionImage-'+productId+' .showmore').length < 1) {
                                product_wrapper.find('.card_optionImage-'+productId+' .form-field').append('<a href="'+productLink+'" class="showmore">+'+countMoreOption+'</a>');
                            }
                        }

                        if(product_wrapper.find('.card_optionImage-'+productId+' .form-option').length < 0){
                           product_wrapper.find('.card_optionImage-'+productId).remove();
                        }

                        //Size Option
                        product_wrapper.find('.card_optionSize-'+productId+' .form-option').each(function() {
                            var txt = $(this).data('product-attribute-value');

                            if (arr[txt]){
                                $(this).remove();
                            } else {
                                arr[txt] = true;
                            }
                        });
                        
                        if(product_wrapper.find('.card_optionSize-'+productId+' .form-option').length > 4){
                            var countMoreOption  = product_wrapper.find('.card_optionSize-'+productId+' .form-option').length - 4,
                                productLink = product_wrapper.find('[data-product-id="'+productId+'"]').find('.card-title > a').attr('href');

                            product_wrapper.find('.card_optionSize-'+productId+' .form-option').each(function(i){
                                if(i >= 4){
                                  $(this).remove();
                                }
                            });

                            if (product_wrapper.find('.card_optionSize-'+productId+' .showmore').length < 1) {
                                product_wrapper.find('.card_optionSize-'+productId+' .form-field').append('<a href="'+productLink+'" class="showmore">+'+countMoreOption+'</a>');
                            }
                        }

                        if(product_wrapper.find('.card_optionSize-'+productId+' .form-option').length < 0){
                            product_wrapper.find('.card_optionSize-'+productId).remove();
                        }
                    });

                });
            }
        }

        function getProductOption(list){
            return fetch('/graphql', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                  query: `
                    query SeveralProductsByID {
                      site {
                        products(entityIds: [`+list+`], first: 50) {
                          edges {
                            node {
                              entityId
                              name
                               productOptions(first: 50) {
                                edges {
                                  node {
                                    entityId
                                    displayName
                                    isRequired
                                    ... on MultipleChoiceOption {
                                      displayStyle
                                      values {
                                        edges {
                                          node {
                                            entityId
                                            label
                                            isDefault
                                            ... on SwatchOptionValue {
                                              hexColors
                                              imageUrl(width: 100)
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  `}),
            }).then(res => res.json()).then(res => res.data);
        }

        function renderOption(data){
            var aFilter = data.site.products.edges;

            $.each(aFilter, function(i){
                var productId = aFilter[i].node.entityId,
                    aFilter2 = aFilter[i].node.productOptions.edges;

                var aFilterColor = aFilter2.filter(function (item) {
                    return item.node.displayStyle === 'Swatch';
                });

                var aFilterSize = aFilter2.filter(function (item) {
                    return item.node.displayName === 'Size';
                });

                // Get Color Option
                if(aFilterColor.length > 0){
                    var aFilter4 = aFilterColor[0].node.values.edges;

                    $.each(aFilter4, function(j){
                        if(aFilter4[j].node.hexColors.length == 2){
                            var color1 = aFilter4[j].node.hexColors[0],
                                color2 = aFilter4[j].node.hexColors[1];
                            product_class.find('.card_optionImage-'+productId+' .form-field').append('<label class="form-option form-option-swatch two-colors" data-product-swatch-value="'+aFilter4[j].node.entityId+'"><span class="form-option-variant form-option-variant--color two-colors '+aFilter4[j].node.label+'" title="'+aFilter4[j].node.label+'" style="background-color:'+color1+'"></span><span class="form-option-variant form-option-variant--color two-colors '+aFilter4[j].node.label+'" title="'+aFilter4[j].node.label+'" style="background-color:'+color2+'"></span></label>');

                        } else if(aFilter4[j].node.hexColors.length == 3){
                            var color1 = aFilter4[j].node.hexColors[0],
                                color2 = aFilter4[j].node.hexColors[1],
                                color3 = aFilter4[j].node.hexColors[2];
                            product_class.find('.card_optionImage-'+productId+' .form-field').append('<label class="form-option form-option-swatch two-colors three-colors" data-product-swatch-value="'+aFilter4[j].node.entityId+'"><span class="form-option-variant form-option-variant--color three-colors '+aFilter4[j].node.label+'" title="'+aFilter4[j].node.label+'" style="background-color:'+color1+'"></span><span class="form-option-variant form-option-variant--color three-colors '+aFilter4[j].node.label+'" title="'+aFilter4[j].node.label+'" style="background-color:'+color2+'"></span><span class="form-option-variant form-option-variant--color three-colors '+aFilter4[j].node.label+'" title="'+aFilter4[j].node.label+'" style="background-color:'+color3+'"></span></label>');

                        } else{
                            var color = aFilter4[j].node.hexColors[0],
                                img = aFilter4[j].node.imageUrl;

                            if(color != undefined){
                                product_class.find('.card_optionImage-'+productId+' .form-field').append('<label class="form-option form-option-swatch" data-product-swatch-value="'+aFilter4[j].node.entityId+'"><span class="form-option-variant form-option-variant--color one-color '+aFilter4[j].node.label+'" title="'+aFilter4[j].node.label+'" style="background-color: '+color+'"></span></label>');
                            } else if (img != null){
                               product_class.find('.card_optionImage-'+productId+' .form-field').append('<label class="form-option form-option--image" data-product-swatch-value="'+aFilter4[j].node.entityId+'"><span class="form-option-variant form-option-variant--pattern" title="'+aFilter4[j].node.label+'" style="background-image: url('+img+')"></span></label>');
                            }
                        }
                    });
                } else{
                    product_class.find('.card_optionImage-'+productId).remove();
                }

                //Get Size Option
                if(aFilterSize.length > 0){
                    var aFilter5 = aFilterSize[0].node.values.edges;
                     $.each(aFilter5, function(j){
                        var size = aFilter5[j].node.label;
                        product_class.find('.card_optionSize-'+productId+' .form-field').append('<label class="form-option" data-product-attribute-value="'+aFilter5[j].node.entityId+'"><span class="form-option-variant">'+size+'</span></label>');
                     })
                } else {
                    product_class.find('.card_optionSize-'+productId).remove();
                }

            });
        }

        callProductOption();
    }
}
