import $ from 'jquery';

export default function(context) {
    var file =  "/content/find-your-territory-manager/fytm-product.csv";
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
    var template;
    var heading;
    var jsonArray = new Array();
    var $fytm_form = $('#fytm-form');
    var customer_zip = $('#fytmResult').data('customer-zip');

    readTextFile(file);

    function splitCSVtoCells( row, split) {
        return row.split( split );
    }

    function readTextFile(file)
    {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function (e)
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    var allText = rawFile.responseText;
                    template = (allText);
                    var rows = allText.split("\r\n");
                    
                    if(rows.length>0){
                        var first_Row_Cells = splitCSVtoCells(rows[0], ","); //Taking Headings
                        heading = first_Row_Cells; 
                        /*------ heading ------*/

                        /*------ show year option ------*/
                        for(var i=1;i<rows.length;i++)
                        {
                            var pIds = "";
                            var subStr = rows[i].match(',"(.*)"');
                            if( subStr != undefined){
                                pIds = (subStr[1]);
                                rows[i] = rows[i].replace( '"' + pIds + '"', '{{id}}');
                            }
                            
                            var cells = splitCSVtoCells(rows[i], ",");

                            var obj = {};
                            for(var j=0;j<cells.length-1;j++)
                            {
                                obj[first_Row_Cells[j]] = cells[j];
                            }

                            var col_pro = first_Row_Cells.length - 1;
                            if( pIds != "" ) {
                                obj[first_Row_Cells[ col_pro ]] = pIds;
                            }
                            else{
                                obj[first_Row_Cells[ col_pro ]] = cells[ col_pro ];
                            }

                            jsonArray.push(obj);
                        }
                        
                    }
                }
            }
        }
        rawFile.send(null);
    }

    $fytm_form.submit(function(event) {
        event.preventDefault();
        const t_val = $(this).find('#fytmZip').val();

        add_TM(t_val);
    });

    if (customer_zip !== '') {
        const t_val = String(customer_zip);

        $('#fytmZip').val(t_val);
        add_TM(t_val);
    }

    function add_TM(t_val) {
        const t_result = $('#fytmResult');
        const result_img = t_result.find('.fytmResult-photo');
        const result_name = t_result.find('.fytmResult-name');
        const result_phone = t_result.find('.fytmResult-phone');
        const t_loading = $('.fytmResult-loading');
        const t_notFound = $('.fytmResult-notFount');
        const t_imgUrl = '/content/find-your-territory-manager/img/';
        const t_imgDe = 'territory-manager-default.png';

        var filter_json = jsonArray.filter(function(search) {
            return search.ZIPCODE === t_val;
        });

        if (filter_json[0] !== undefined) {
            t_notFound.hide();
            t_result.hide();
            t_loading.show();

            if (filter_json[0].Image == '' || filter_json[0].Image == undefined) {
                result_img.find('img').attr('src', t_imgUrl+t_imgDe);
            }
            else {
                result_img.find('img').attr('src', t_imgUrl+filter_json[0].Image);
            }

            result_name.text(filter_json[0].TMName);
            result_phone.text(filter_json[0].Phone).attr('href', 'tel:'+filter_json[0].Phone);
            t_result.attr('data-email', filter_json[0].Email);

            result_img.find('img').one('load', function() {
                t_loading.hide();
                t_result.show();
            });
        }
        else {
            t_result.hide();
            t_notFound.show();
        }
    }
}