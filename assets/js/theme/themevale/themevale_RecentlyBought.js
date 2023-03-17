import $ from 'jquery';
import jqueryCookie from 'jquery.cookie';
import utils from '@bigcommerce/stencil-utils';
const fetch = require('node-fetch');

export default function(context) {
    const token = context.token;

    function recentlyBought() {
        var productIDs = context.themeSettings.recently_bought_productID,
        hoursItems = context.themeSettings.recently_bought_hours,
        listHours = JSON.parse("[" + hoursItems + "]"),
        listIDs = JSON.parse("[" + productIDs + "]"),
        text_info = context.themeSettings.recently_bought_text_info,
        text_name = context.themeSettings.recently_bought_text_name,
        changeSlides = 1000*(Number(context.themeSettings.recently_bought_changeSlides));

        var customerName1 = context.themeSettings.recently_bought_customer_name1;
        var customerName2 = context.themeSettings.recently_bought_customer_name2;
        var customerName3 = context.themeSettings.recently_bought_customer_name3;
        var customerName4 = context.themeSettings.recently_bought_customer_name4;
        var customerName5 = context.themeSettings.recently_bought_customer_name5;
        var ar1 = customerName1.split(', ');
        var ar2 = customerName2.split(', ');
        var ar3 = customerName3.split(', ');
        var ar4 = customerName4.split(', ');
        var ar5 = customerName5.split(', ');
       
        $(".themevale_popup_left").prepend('<div class="hide" id="recently_bought_list"></div>');

        setInterval(function(){
            $('.themevale_recently-bought').hide();
            var item = (Math.floor(Math.random()*listIDs.length)),
                list = [];
            list.push(listIDs[item].toString());
                
            var locationList = Array(ar1,ar2,ar3,ar4,ar5),
                locationItem = (Math.floor(Math.random()*locationList.length)),
                location = locationList[locationItem],
                hour_item = (Math.floor(Math.random()*listHours.length)),
                hours = listHours[hour_item];

            if ($.cookie('recently_bought_notification') == 'closed') {
                $('#recently_bought_list').remove();
            }
            $(document).on('click', '.themevale_recently-bought .modal-close', function(e){
                $('#recently_bought_list').remove();
                $.cookie('recently_bought_notification', 'closed', {expires:1, path:'/'});
            });

            if( $('#RB_'+ listIDs[item]).length ) {
                $('#RB_'+ listIDs[item]).show();
                $('.themevale_recently-bought').css('animation-name','fadeIn');
            }
            else {
                getProductAndSiteInfo(list).then(data => {
                    renderProduct(data.site.products.edges, text_name, hours, text_info, location);
                }); 
            }
            setTimeout(function(){ 
                $('#RB_'+ listIDs[item]).hide();
            }, changeSlides);
        }, changeSlides); 
    }

    function getProductAndSiteInfo(arr) {
      return fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          query: `
            query MyQuery {
                site {
                    products (entityIds: [`+arr+`]) {
                      edges {
                        product: node {
                          ...ProductFields
                          }
                        }
                    }
                }
            }
            fragment ProductFields on Product {
                id
                entityId
                name
                path
                defaultImage {
                    img320px: url(width: 320)
                    altText
                }
            }
        `}),
    }).then(res => res.json())
       .then(res => res.data);
    }

    function renderProduct(product, text, hours, info, customer) {
        var item = product.map(node => node.product);

        var html = '<div id="#RB_'+item[0].entityId+'" class="themevale_recently-bought">\
            <a href="#" class="modal-close" data-close-recently-bought><span aria-hidden="true">&#215;</span></a>\
            <div class="recently-bought-inner">\
                <div class="product-image">\
                    <a href="'+item[0].path+'"><img class="card-image lazyload" data-sizes="auto" src="'+item[0].defaultImage.img320px+'" alt="'+item[0].defaultImage.altText+'" title="'+item[0].defaultImage.altText+'"></a>\
                </div>\
                <div class="product-info">\
                    <p class="text">'+text+' <span class="product-name"><a href="'+item[0].path+'">'+item[0].name+'</a></span></p>\
                    <div id="customer-info">'+hours+' '+info+' '+customer+'</div>\
                </div>\
            </div>\
        </div>';

        $('#recently_bought_list').append(html);
        $('.themevale_recently-bought').css('animation-name','fadeIn');
    }

    if ($(window).width() > 1024) {
        if (context.themeSettings.themevale_RecentlyBought == true) {
            recentlyBought();
        } 
    } else {
        if(context.themeSettings.themevale_RecentlyBought == true && context.themeSettings.themevale_RecentlyBought_mobile == true) {
            recentlyBought();
        }
    }
}
