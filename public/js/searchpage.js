 var $tabs;
        
 $(document).ready(function(){
   
    //mapMarker('map', 1);
    mapMarker('map', 1);

    $( "#price_range" ).val( "Rs." + $( "#price_slider" ).slider( "values", 0) +
       " - Rs." + $( "#price_slider" ).slider( "values", 1 ));
 
    //$("#guests").val("1");
    //$("#query").val("cochin");
        
    $("#sort").prop('selectedIndex', 0);
    $('#query').data('lastValue', 'cochin');
    $('#query').autocomplete({source:'/searchcity'});
 
    $('#price_slider').slider({
        range: true,
        min: 100,
        max:20000,
        values: [100, 20000],
        step:100,
        change: function( event, ui ) {
            $( "#price_range" ).val( "Rs." + ui.values[ 0 ] + " - Rs." + ui.values[ 1 ] );
            refineSearch('price_range', ui.values[0]+'-'+ui.values[1], 'false');
        }
    });
    $( "#price_range" ).val( "Rs." + $( "#price_slider" ).slider( "values", 0 ) +
       " - Rs." + $( "#price_slider" ).slider( "values", 1 ) );

    $tabs = $('#tabs').tabs();
    $tabs.tabs('select', 0);
    $('#tabs').bind('tabsshow', function(event, ui) {
    if (ui.panel.id == "tabs-3") {
        mapMarker('tab_search_map_div', 1,15,1);                    }
    });

    $('input[name$="[]"]').change(function() {
        var facet = $(this).attr('name').replace("[]", "");
        var checked = 'true';
        if (typeof $(this).attr('checked') == 'undefined')
            checked = 'false';
        var value = $(this).val();
        refineSearch(facet, value, checked);
    });

    $('#keywords').keypress(function(e) {
        var code= (e.keyCode ? e.keyCode : e.which);
        if ((code == 13) || (code == 10)) {
            refineSearch('keywords', $(this).val(), false);
            e.preventDefault();
        }
    });
          
 });

function getFacetValues()
{
    //  var features = ['shared', 'amenities', 'onsite_services', 'suitability', 'address__location'];
    var features = ['shared', 'amenities', 'onsite_services', 'suitability'];
    for (var i in features) {
        var feature = features[i];
        $(".lbox_"+feature).children().remove();
        $(".acc_section").find("[name='"+feature+"[]']").each(
               function() {
                        var checked = $(this).is(':checked');
                        addCheckBox(feature, $(this).val(), $(this).next().text(), $(this).next().next().text(), checked);
               });
    };

    var feature = "address__location";
    $(".lbox_"+feature).children().remove();
    $(".lbox_"+feature+"_r").children().remove();
    var rc=false;
    var tmp=feature;
    $(".acc_section").find("[name='"+feature+"[]']").each(
            function() {
                var checked = $(this).is(':checked');
                if( rc == true ){
                    tmp = feature+"_r";
                    rc = false;
                } else {
                    tmp = feature;
                    rc = true;
                }
                addCheckBox(tmp, $(this).val(), $(this).next().text(), $(this).next().next().text(), checked);
           }
    );
};

    
function addCheckBox(feature, name, label, value, checked) {
    
    var container = $(".lbox_"+feature);
    //alert(feature+','+name+','+label+','+value+','+checked);
    var checked_flag = '';
    if (checked) {
        checked_flag = 'checked="yes"';
    }
    var html = '<li class="clearfix"><input type="checkbox" id="lbox_'+feature+'" value="'+name+'" class="l_styled"' + checked_flag +'/>' +
            '<label>'+label+'</label> <span class="facet_count">'+value+'</span></li>';
    //alert(html);
    container.append(html);
}

function setSelections()
{
    var features = ['shared', 'amenities', 'onsite_services', 'suitability', 'address__location', 'address__location_r'];
    for (var i in features) {
        feature = features[i];
        var checked = new Array();
        $("[id='lbox_"+feature+"']:checked").each(function()
        {
           checked.push($(this).val());
        });
        setCheckBox(feature, checked);
    }

        /*feature = "address__location_r";
        $("[id='lbox_"+feature+"']:checked").each(function()
        {
            checked.push($(this).val());
        });
        setCheckBox(feature, checked);*/
}

function setCheckBox(feature, values) {
    feature = feature.replace(/_r$/, '');
    $("[name='"+feature+"[]']").removeAttr('checked');
    $("[name='"+feature+"[]']").val(values);
    //alert(feature+','+values.toString());
}
