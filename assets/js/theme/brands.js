import PageManager from './page-manager';
import themevaleAZBrands from './themevale/themevale_AZBrands';

export default class Brands extends PageManager {
	constructor(context) {
        super(context);
    }
    
	onReady() {
		themevaleAZBrands(this.context);
    }
}
