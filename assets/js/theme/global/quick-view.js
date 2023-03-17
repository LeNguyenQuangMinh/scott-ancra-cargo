import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import ProductDetails from '../common/product-details';
import { defaultModal } from './modal';
import Countdown from '../themevale/themevale_Countdown';
import 'slick-carousel';

export default function (context) {
    const modal = defaultModal();

    $('body').on('click', '.quickview', event => {
        event.preventDefault();

        const productId = $(event.currentTarget).data('productId');

        modal.open({ size: 'large' });
        $('#modal').addClass('modal-quickview');

        utils.api.product.getById(productId, { template: 'products/quick-view' }, (err, response) => {
            modal.updateContent(response);

            // modal.$content.parent().addClass('modal-quickview');

            modal.$content.find('.productView').addClass('productView--quickView');

            modal.$content.find('[data-slick]').slick();

            Countdown(productId);

            const productCurrentstock = Number($('[data-product-id="'+productId+'"] span[data-product-stock]').html());
            
            var i = 1, temp = productCurrentstock;
            for(i; temp > 10; i++) {
                temp = Math.floor(temp / 10);
            }
            $('[data-product-id="'+productId+'"] .progress-meter').css('width', (productCurrentstock/Math.pow(10, i))*100 + '%');

            return new ProductDetails(modal.$content.find('.quickView'), context);
        });
    });
}
