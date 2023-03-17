import $ from 'jquery';

export default function(product_id){

    var repeat = true;
    var showCountDay = true;
    var showDate = false;
    var product_Description_content = $('.countdownValue_'+product_id).first();
    var result = product_Description_content.text().trim();
    $('.countdownValue_'+product_id).remove();

    if(result !== null && $("#countDownDate_"+product_id).length === 1) {
        
        $('#countDownDate_'+product_id).show();

        var endDateTime = result;//y,m,d,h:i:s

        // Set the date we're counting down to
        var countDownDate = new Date(endDateTime).getTime();
        var endDate = new Date(endDateTime);

        // Update the count down every 1 second
        var x = setInterval(function() {

            // Get todays date and time
            var now = new Date().getTime();
            
            // Find the distance between now an the count down date
            
            
            if(countDownDate < now && repeat){
                $('.productView-countDown').remove();
                $('.productView-progress').hide();
                return;
                // var days = Math.floor((now - countDownDate) / (1000 * 60 * 60 * 24)) + 1;
                // countDownDate += (1000 * 60 * 60 * 24) * days;
            }
            
            var distance = countDownDate - now;
            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            var strCountDown = "<span class='block-time'>"+showTime(hours) + "<span class='block-label'>hours</span></span><span class='block-time'>" + showTime(minutes) + "<span class='block-label'>mins</span></span><span class='block-time'>" + showTime(seconds) + "<span class='block-label'>secs</span></span>";
            if(showCountDay){
                strCountDown = "<span class='block-time'>"+showDateFormat(days) + "<span class='block-label'>days</span></span>" + strCountDown;
            }
            if(showDate){
                strCountDown += "<span class='block-date'>" + endDate.toDateString() + "</span>";
            }
            
            // Output the result in an element with id="demo"
            $(".countDownDate").html(strCountDown);
            $('.productView-countDown').removeClass('hide');
            $('.productView-progress').removeClass('hide');
            
            // If the count down is over, write some text 
            if (distance < 0) {
                clearInterval(x);
                var strCountDown = "<span class='block-time'>"+showTime(0) + "<span class='block-label'>hours</span></span><span class='block-time'>" + showTime(0) + "<span class='block-label'>minutes</span></span><span class='block-time'>" + showTime(0) + "<span class='block-label'>seconds</span></span>";
                if(showCountDay){
                    strCountDown = "<span class='block-time'>"+showDateFormat(0) + "<span class='block-label'>days</span></span>" + strCountDown;
                }
                if(showDate){
                    strCountDown += "<span class='block-date'>" + endDate.toDateString() + "</span>";
                }
                $(".countDownDate").html(strCountDown);
                $('.productView-countDown').removeClass('hide');
                $('.productView-progress').removeClass('hide');
            }
        }, 1000);
    }

    function showTime(t){
        if(t < 10){
            return "<span class='num'>0</span><span class='num'>"+t+"</span>";
        }
        return "<span class='num'>"+parseInt(t/10)+"</span><span class='num'>"+(t%10)+"</span>";
    }

    function showDateFormat(t){
        if(t < 10){
            return "<span class='num'>0</span><span class='num'>"+t+"</span>";
        }
        if(t > 100){
            return showDateFormat(parseInt(t/10))+"<span class='num'>"+(t%10)+"</span>";
        }
        return "<span class='num'>"+parseInt(t/10)+"</span><span class='num'>"+(t%10)+"</span>";
    }
}
