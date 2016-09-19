// tmp values
var shipOne = null;
var shipTwo = null;

$(document).ready(function() {

    // Clear boxes
    $('#shipOneSearch').val('');
    $('#shipTwoSearch').val('');

    // algolia-autocomplete
    var client = algoliasearch('JXS80KHU8P', 'ce0e3984181fb0fc71f26a20c56d9725')
    var index = client.initIndex('ships_');
    autocomplete(
        '#shipOneSearch',
        {
            hint: true
        },
        [
            {
              source: autocomplete.sources.hits(index, {hitsPerPage: 3}),
              displayKey: 'name',
              templates: {
                suggestion: function(suggestion) {
                  return suggestion._highlightResult.name.value;
                }
              }
            }
    ]).on('autocomplete:selected', function(event, suggestion, dataset) {

        if(suggestion === undefined) {
            return;
        }

        shipOne = $.parseJSON(suggestion.value);
        setValues('one', shipOne);
    });


    autocomplete(
        '#shipTwoSearch',
        {
            hint: true
        },
        [
            {
              source: autocomplete.sources.hits(index, {hitsPerPage: 3}),
              displayKey: 'name',
              templates: {
                suggestion: function(suggestion) {
                  return suggestion._highlightResult.name.value;
                }
              }
            }
    ]).on('autocomplete:selected', function(event, suggestion, dataset) {

        if(suggestion === undefined) {
            return;
        }

        shipTwo = $.parseJSON(suggestion.value);
        setValues('two', shipTwo);
    });

});

function setValues(column, data) {

    highlight();

    var misc = find(data.structure, 'Miscellaneous').value;

    // Name
    $('#' + column + 'Name').text(data.name);

    // Manufacturer
    $('#' + column + 'Manufacturer').text(data.manufacturer.name + ' (' + data.manufacturer.code + ')');

    // Focus
    $('#' + column + 'Focus').text(data.focus);

    // Dimension
    $('#' + column + 'Dimension').text(
        data.dimension.length + 'm x ' + data.dimension.beam + 'm x ' + data.dimension.height + 'm'
        + ' (' + (data.dimension.length * data.dimension.beam * data.dimension.height).toFixed(2)  + 'm³)'
    );

    // Null-Cargo Mass
    $('#' + column + 'NullCargoMass').text(data.mass.null_cargo + ' Kg');

    // Cargo Capacity
    $('#' + column + 'CargoCapacity').text(
        find(misc, 'Cargo capacity').value + ' SCU'
    );

    // Max Crew
    $('#' + column + 'MaxCrew').text(
        find(misc, 'Max crew').value + ' people'
    );

    // Engine
    var engine = find(data.structure, 'Engine').value;
    var engineValue = [];

    $.each(engine, function() {
        engineValue.push(
            this.multiplier + 'x ' + this.model +  ' R' + this.rating
        );
    });
    $('#' + column + 'Engine').text(
        (engineValue.length === 0 ? 'N/A' : engineValue.join('<br />'))
    );

    // Thrusters
    var thrusters = find(data.structure, 'Thrusters').value;
    var thrustersValue = [];

    $.each(thrusters, function() {
        thrustersValue.push(
            this.multiplier + 'x ' + this.model
        );
    });
    $('#' + column + 'Thrusters').html(
        (thrustersValue.length === 0 ? 'N/A' : thrustersValue.join('<br />'))
    );

    // Shield
    var shield = find(data.structure, 'Shield').value;
    var shieldValue = [];

    $.each(shield, function() {
        shieldValue.push(
            this.multiplier + 'x ' + this.model
        );
    });
    $('#' + column + 'Shield').html(
        (shieldValue.length == null ? 'N/A' : shieldValue.join('<br />'))
    );

    // Factory power plant
    var factoryPowerPlant = find(data.structure, 'Factory power plant').value;
    var factoryPowerPlantValue = [];

    $.each(factoryPowerPlant, function() {
        factoryPowerPlantValue.push(
            this.multiplier + 'x ' + this.model
        );
    });
    $('#' + column + 'FactoryPowerPlant').html(
        (factoryPowerPlantValue.length === 0 ? 'N/A' : factoryPowerPlantValue.join('<br />'))
    );

    // Additional
    var additional = find(misc, 'Additional');
    $('#' + column + 'Additional').html(
        (additional.length === 0 ? 'Nothing' : additional.value.map(function(value) {
            return value.name;
        }).join('<br />'))
    );
}

function find(data, area) {
    var result = null;

    $.each(data, function(key, value) {
        if(value.name === area) {
            result = value;
        }
    });

    return result;
}

function highlight() {

    // Clear highlighting
    $('td').each(function() {

        $(this).removeAttr('class');
        $(this).removeAttr('title');

        try {
            $(this).tooltipster('destroy');
        } catch(e) {
            // TODO To use a try-catch-block sucks...
        }

    })

    // We need to ships to compare... obvs
    if(shipOne === null || shipTwo === null) {
        return;
    }

    var miscOne = find(shipOne.structure, 'Miscellaneous').value;
    var miscTwo = find(shipTwo.structure, 'Miscellaneous').value;

    // Compare Dimension
    setHighlighting(
        'Dimension',
        (shipOne.dimension.length * shipOne.dimension.beam * shipOne.dimension.height),
        (shipTwo.dimension.length * shipTwo.dimension.beam * shipTwo.dimension.height),
        function(state) {

            if(state == 0) {
                return null;
            }

            var value = null;

            switch(state) {

                case 1: value = (
                        'The ' + shipOne.name + ' is <span class="yellow">' + (shipOne.dimension.length / shipTwo.dimension.length).toFixed(2) + 'x longer</span>, <span class="yellow">' + (shipOne.dimension.beam / shipTwo.dimension.beam).toFixed(2) + 'x wider</span> and <span class="yellow">' + (shipOne.dimension.height / shipTwo.dimension.height).toFixed(2) + 'x higher</span> than the ' + shipTwo.name + '.'
                    );
                    break;

                case 2: value = (
                        'The ' + shipTwo.name + ' is <span class="yellow">' + (shipTwo.dimension.length / shipOne.dimension.length).toFixed(2) + 'x longer</span>, <span class="yellow">' + (shipTwo.dimension.beam / shipOne.dimension.beam).toFixed(2) + 'x wider</span> and <span class="yellow">' + (shipTwo.dimension.height / shipOne.dimension.height).toFixed(2) + 'x higher</span> than the ' + shipOne.name + '.'
                    );
                    break;

            }


            return value;

        }
    );

    // Compare Null-Cargo Mass
    /*setHighlighting(
        'NullCargoMass',
        shipOne.mass.null_cargo,
        shipTwo.mass.null_cargo,
        function(state) {

            if(state == 0) {
                return null;
            }

            var value = null;

            switch(state) {

                case 1: value = (
                        'The ' + shipTwo.name + ' null-cargo mass is only <span class="yellow">' + ((shipTwo.mass.null_cargo / shipOne.mass.null_cargo) * 100).toFixed(2)  + '%</span> of ' + shipOne.name + '\'s null-cargo mass.'
                    );
                    break;

                case 2: value = (
                        'The ' + shipOne.name + ' null-cargo mass is only <span class="yellow">' + ((shipOne.mass.null_cargo / shipTwo.mass.null_cargo) * 100).toFixed(2) + '%</span> of ' + shipTwo.name + '\'s null-cargo mass.'
                    );
                    break;

            }


            return value;

        }
    );*/

    // Compare Cargo Capacity
    var cargoOneValue = find(miscOne, 'Cargo capacity').value;
    var cargoTwoValue = find(miscTwo, 'Cargo capacity').value;

    setHighlighting(
        'CargoCapacity',
        cargoOneValue,
        cargoTwoValue,
        function(state) {

            if(state == 0) {
                return null;
            }

            var value = null;

            switch(state) {

                case 1: value = (
                        'The ' + shipOne.name + ' can transport <span class="yellow">' + (cargoOneValue / cargoTwoValue).toFixed(2) + 'x more SCUs</span> than the ' + shipTwo.name + '.'
                    );
                    break;

                case 2: value = (
                        'The ' + shipTwo.name + ' can transport <span class="yellow">' + (cargoTwoValue / cargoOneValue).toFixed(2) + 'x more SCUs</span> than the ' + shipOne.name + '.'
                    );
                    break;

            }


            return value;

        }
    );

    // Compare Max Crew
    var maxCrewOne = find(miscOne, 'Max crew').value;
    var maxCrewTwo = find(miscTwo, 'Max crew').value;

    setHighlighting(
        'MaxCrew',
        maxCrewOne,
        maxCrewTwo,
        function(state) {

            if(state == 0) {
                return null;
            }

            var value = null;

            switch(state) {

                case 1: value = (
                        'The ' + shipOne.name + ' can handle <span class="yellow">' + (maxCrewOne / maxCrewTwo).toFixed(2) + 'x more crew members</span> than the ' + shipTwo.name + '.'
                    );
                    break;

                case 2: value = (
                        'The ' + shipTwo.name + ' can handle <span class="yellow">' + (maxCrewTwo / maxCrewOne).toFixed(2) + 'x more crew members</span> than the ' + shipOne.name + '.'
                    );
                    break;

            }


            return value;

        }
    );

    // Compare Engine
    var engineOne = find(shipOne.structure, 'Engine');
    var engineTwo = find(shipTwo.structure, 'Engine');

    var engineOneValue = 0;
    var engineTwoValue = 0;

    $.each(engineOne.value, function() { engineOneValue += (Math.max(this.size, 1) * Math.max(this.rating, 1) * this.multiplier); });
    $.each(engineTwo.value, function() { engineTwoValue += (Math.max(this.size, 1) * Math.max(this.rating, 1) * this.multiplier); });

    setHighlighting(
        'Engine',
        engineOneValue,
        engineTwoValue,
        function(state) {

            if(state == 0) {
                return null;
            }

            var value = null;

            switch(state) {

                case 1:

                    // Ship One
                    value = shipOne.name + '\'s Engines:<br/><br />';

                    $.each(engineOne.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">rating of ' + this.rating + '</span> and a <span class="yellow">size of ' + this.size + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += engineOneValue + '<br /><br />';

                    // Ship Two
                    value += shipTwo.name + '\'s Engines:<br/><br />';

                    $.each(engineTwo.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">rating of ' + this.rating + '</span> and a <span class="yellow">size of ' + this.size + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += engineTwoValue + '<br /><br />';

                    value += 'This results in a <span class="yellow">' + (engineOneValue / engineTwoValue).toFixed(2) + 'x</span> higher <span class="yellow">score (' + engineOneValue + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + engineTwoValue + ')</span>.';
                    break;

                case 2:

                    // Ship Two
                    value = shipTwo.name + '\'s Engines:<br/><br />';

                    $.each(engineTwo.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">rating of ' + this.rating + '</span> and a <span class="yellow">size of ' + this.size + '</span>.<br />'
                        );
                    });


                    value += '<span class="yellow">-----</span><br/>';
                    value += engineTwoValue + '<br /><br />';

                    // Ship one
                    value += shipOne.name + '\'s Engines:<br/><br />';

                    $.each(engineOne.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">rating of ' + this.rating + '</span> and a <span class="yellow">size of ' + this.size + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += engineOneValue + '<br /><br />';


                    value += 'This results in a <span class="yellow">' + (engineTwoValue / engineOneValue).toFixed(2) + 'x</span> higher <span class="yellow">score (' + engineTwoValue + ')</span> than <span class="yellow">' + shipOne.name + '\'s score (' + engineOneValue + ')</span>.';
                    break;

            }

            return value;

        }
    );

    // Compare Thrusters
    var thrustersOne = find(shipOne.structure, 'Thrusters');
    var thrustersTwo = find(shipTwo.structure, 'Thrusters');

    var thrustersValueOne = 0;
    var thrustersValueTwo = 0;

    $.each(thrustersOne.value, function() { thrustersValueOne += (Math.max(this.size, 1) * Math.max(this.rating, 1) * this.multiplier); });
    $.each(thrustersTwo.value, function() { thrustersValueTwo +=  (Math.max(this.size, 1) * Math.max(this.rating, 1) * this.multiplier); });

    setHighlighting(
        'Thrusters',
        thrustersValueOne,
        thrustersValueTwo,
        function(state) {

            if(state == 0) {
                return null;
            }

            var value = null;

            switch(state) {

                case 1:

                    // Ship One
                    value = shipOne.name + '\'s Thrusters:<br/><br />';

                    $.each(thrustersOne.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">rating of ' + this.rating + '</span> and a <span class="yellow">size of ' + this.size + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += thrustersValueOne + '<br /><br />';

                    // Ship Two
                    value += shipTwo.name + '\'s Thrusters:<br/><br />';

                    $.each(thrustersTwo.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">rating of ' + this.rating + '</span> and a <span class="yellow">size of ' + this.size + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += thrustersValueTwo + '<br /><br />';

                    value += 'This results in a <span class="yellow">' + (thrustersValueOne / thrustersValueTwo).toFixed(2) + 'x</span> higher <span class="yellow">score (' + thrustersValueOne + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + thrustersValueTwo + ')</span>.';
                    break;

                case 2:

                    // Ship Two
                    value = shipTwo.name + '\'s Thrusters:<br/><br />';

                    $.each(thrustersTwo.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">rating of ' + this.rating + '</span> and a <span class="yellow">size of ' + this.size + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += thrustersValueTwo + '<br /><br />';

                    // Ship One
                    value += shipOne.name + '\'s Thrusters:<br/><br />';

                    $.each(thrustersOne.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">rating of ' + this.rating + '</span> and a <span class="yellow">size of ' + this.size + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += thrustersValueOne + '<br /><br />';

                    value += 'This results in a <span class="yellow">' + (thrustersValueTwo / thrustersValueOne).toFixed(2) + 'x</span> higher <span class="yellow">score (' + thrustersValueTwo + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + thrustersValueOne + ')</span>.';
                    break;

            }

            return value;

        }
    );

    // Compare Shield
    var shieldOne = find(shipOne.structure, 'Shield');
    var shieldTwo = find(shipTwo.structure, 'Shield');

    var shieldOneValue = 0;
    var shieldTwoValue = 0;

    $.each(shieldOne.value, function() { shieldOneValue += (Math.max(this.size, 1) * this.multiplier + this.maxSize); });
    $.each(shieldTwo.value, function() { shieldTwoValue += (Math.max(this.size, 1) * this.multiplier + this.maxSize); });

    setHighlighting(
        'Shield',
        shieldOneValue,
        shieldTwoValue,
        function(state) {

            if(state == 0) {
                return null;
            }

            var value = null;

            switch(state) {

                case 1:

                    // Ship One
                    value = shipOne.name + '\'s Shields:<br/><br />';

                    $.each(shieldOne.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">size of ' + this.size + '</span> and a <span class="yellow">max. size of ' + this.maxSize + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += shieldOneValue + '<br /><br />';

                    // Ship Two
                    value += shipTwo.name + '\'s Shields:<br/><br />';

                    $.each(shieldTwo.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">size of ' + this.size + '</span> and a <span class="yellow">max. size of ' + this.maxSize + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += shieldTwoValue + '<br /><br />';

                    value += 'This results in a <span class="yellow">' + (shieldOneValue / shieldTwoValue).toFixed(2) + 'x</span> higher <span class="yellow">score (' + shieldOneValue + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + shieldTwoValue + ')</span>.';
                    break;

                case 2:

                    // Ship Two
                    value = shipTwo.name + '\'s Shields:<br/><br />';

                    $.each(shieldTwo.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">size of ' + this.size + '</span> and a <span class="yellow">max. size of ' + this.maxSize + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += shieldTwoValue + '<br /><br />';

                    // Ship One
                    value += shipOne.name + '\'s Shields:<br/><br />';

                    $.each(shieldOne.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">size of ' + this.size + '</span> and a <span class="yellow">max. size of ' + this.maxSize + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += shieldOneValue + '<br /><br />';

                    value += 'This results in a <span class="yellow">' + (shieldTwoValue / shieldOneValue).toFixed(2) + 'x</span> higher <span class="yellow">score (' + shieldTwoValue + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + shieldOneValue + ')</span>.';
                    break;

            }

            return value;

        }
    );

    // Compare Factory power plants
    var factoryPowerPlantOne = find(shipOne.structure, 'Factory power plant');
    var factoryPowerPlantTwo = find(shipTwo.structure, 'Factory power plant');

    var factoryPowerPlantOneValue = 0;
    var factoryPowerPlantTwoValue = 0;

    $.each(factoryPowerPlantOne.value, function() { factoryPowerPlantOneValue += (Math.max(this.size, 1) * this.multiplier + this.maxSize); });
    $.each(factoryPowerPlantTwo.value, function() { factoryPowerPlantTwoValue += (Math.max(this.size, 1) * this.multiplier + this.maxSize); });

    setHighlighting(
        'FactoryPowerPlant',
        factoryPowerPlantOneValue,
        factoryPowerPlantTwoValue,
        function(state) {

            if(state == 0) {
                return null;
            }

            var value = null;

            switch(state) {

                case 1:

                    // Ship One
                    value = shipOne.name + '\'s Factory Power Plants:<br/><br />';

                    $.each(factoryPowerPlantOne.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">size of ' + this.size + '</span> and a <span class="yellow">max. size of ' + this.maxSize + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += factoryPowerPlantOneValue + '<br /><br />';

                    // Ship Two
                    value += shipTwo.name + '\'s Factory Power Plants:<br/><br />';

                    $.each(factoryPowerPlantTwo.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">size of ' + this.size + '</span> and a <span class="yellow">max. size of ' + this.maxSize + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += factoryPowerPlantTwoValue + '<br /><br />';

                    value += 'This results in a <span class="yellow">' + (factoryPowerPlantOneValue / factoryPowerPlantTwoValue).toFixed(2) + 'x</span> higher <span class="yellow">score (' + factoryPowerPlantOneValue + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + factoryPowerPlantTwoValue + ')</span>.';
                    break;

                case 2:

                    // Ship Two
                    value = shipTwo.name + '\'s Factory Power Plants:<br/><br />';

                    $.each(factoryPowerPlantTwo.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">size of ' + this.size + '</span> and a <span class="yellow">max. size of ' + this.maxSize + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += factoryPowerPlantTwoValue + '<br /><br />';

                    // Ship One
                    value += shipOne.name + '\'s Factory Power Plants:<br/><br />';

                    $.each(factoryPowerPlantOne.value, function() {
                        value += (
                            '+ ' + this.model + ' exists <span class="yellow">' + this.multiplier + ' time(s)</span> with a <span class="yellow">size of ' + this.size + '</span> and a <span class="yellow">max. size of ' + this.maxSize + '</span>.<br />'
                        );
                    });

                    value += '<span class="yellow">-----</span><br/>';
                    value += factoryPowerPlantOneValue + '<br /><br />';

                    value += 'This results in a <span class="yellow">' + (factoryPowerPlantTwoValue / factoryPowerPlantOneValue).toFixed(2) + 'x</span> higher <span class="yellow">score (' + factoryPowerPlantTwoValue + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + factoryPowerPlantOneValue + ')</span>.';
                    break;

            }

            return value;

        }
    );

    // Load Tooltips
    $('.tooltip').tooltipster({
        theme: 'tooltipster-punk',
        trigger: 'hover',
        contentAsHTML: true
    });

}

function setHighlighting(field, attributeOne, attributeTwo, callback = null) {

    var state = 0;

    if(attributeOne === attributeTwo) {
        state = 0;

        $('#one' + field).attr('class', 'yellow');
        $('#one' + field).removeAttr('title');
        $('#one' + field).removeClass('tooltip');

        $('#two' + field).attr('class', 'yellow');
        $('#two' + field).removeAttr('title');
        $('#two' + field).removeClass('tooltip');

    } else if(attributeOne > attributeTwo) {
        state = 1;
        $('#one' + field).attr('class', 'green');
    } else {
        state = 2;
        $('#two' + field).attr('class', 'green');
    }

    if(!(callback === null)) {
        var message = callback(state);

        if(message === null) {
            return;
        }

        switch(state) {

            case 0:
            break;

            case 1:
                $('#one' + field).attr('title', message);
                $('#one' + field).addClass('tooltip');
            break;

            case 2:
                $('#two' + field).attr('title', message);
                $('#two' + field).addClass('tooltip');
            break;

        }
    }

}
