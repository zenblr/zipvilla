var mostViewedCarousel = null;
var mostBookedCarousel = null;
var mostRatedCarousel = null;
var mostBookedData = [];
var mostRatedData = [];
var mostViewedData = [];
var tabbed = false;

function getVisibleCount(datasize) {
	var count = 6;
	return datasize > 6 ? 6: datasize;
}

function loadMostViewed_itemLoadCallback(carousel, state)
{
	for (var i = carousel.first; i <= carousel.last; i++) {
		if( i == 0 ) i = mostViewedData.length;;
		if (carousel.has(i))	continue;
		if (i > mostViewedData.length)	break;
		if( carousel.last <= mostViewedData.length )
			carousel.add(i, mostViewedData[i-1]);
		//alert("i: "+i+" cF: "+ carousel.first + " cL: "+carousel.last + " cS: "+carousel.length);
	}
};

function loadMostBooked_itemLoadCallback(carousel, state)
{
	for (var i = carousel.first; i <= carousel.last; i++) {
		if( i == 0 ) i = mostBookedData.length;
		if (carousel.has(i))  continue;
		if (i > mostBookedData.length)  break;
		if( carousel.last <= mostBookedData.length )
			carousel.add(i, mostBookedData[i-1]);
	}
};

function loadMostRated_itemLoadCallback(carousel, state)
{
	for (var i = carousel.first; i <= carousel.last; i++) {
		if( i == 0 ) i = mostRatedData.length;
		if (carousel.has(i)) continue;
		if (i > mostRatedData.length)  break;
		if( carousel.last <= mostRatedData.length )		
			carousel.add(i, mostRatedData[i-1]);
	}
};


$(document).ready(function() {
	var $tabs = $('#tabs').tabs();
	
		$("#guests").val('1');
		$('#query').data('lastValue', '<?php //echo $this->search_query;?>');
		$('#query').autocomplete({source:'/default/search/autocomplete/format/json'});

		$('#search_form_home').submit(function() {
			if( $('#query').val() == "") {
					$('#set_location').show();
					$(".defaultText").blur();
					return false;
			}
		});

		$('#tabs').bind('tabsshow', function(event, ui) {
			switch(ui.index) {
			case 0:	
				$('#mostViewedCarousel').jcarousel({
					size: mostViewedData.length, wrap:"circular", visible:getVisibleCount(mostViewedData.length),
					itemLoadCallback: {onBeforeAnimation: loadMostViewed_itemLoadCallback}
				});
				break;

			case 1: 
				$('#mostBookedCarousel').jcarousel({
					size: mostBookedData.length, wrap:"circular", visible:getVisibleCount(mostBookedData.length),
					itemLoadCallback: {onBeforeAnimation: loadMostBooked_itemLoadCallback}
				})
				break;

			case 2: 
				$('#mostRatedCarousel').jcarousel({
					size: mostRatedData.length, wrap:"circular", visible:getVisibleCount(mostRatedData.length),
					itemLoadCallback: {onBeforeAnimation: loadMostRated_itemLoadCallback}
				})
				break;

				default:
					break;

			}
        return true;
    });

		
    $tabs.tabs('select', 0);
		if( !tabbed ) {
			$('#mostViewedCarousel').jcarousel({
				size: mostViewedData.length, wrap:"circular", visible:getVisibleCount(mostViewedData.length),
				itemLoadCallback: {onBeforeAnimation: loadMostViewed_itemLoadCallback}
			});
			tabbed = true;
		}
});
