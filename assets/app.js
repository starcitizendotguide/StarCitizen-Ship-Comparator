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
    var engine = find(data.structure, 'Engine');
    $('#' + column + 'Engine').text(
        (engine.value.model == null ? 'N/A' : (engine.multiplier + 'x ' + engine.value.model))
    );

    // Thrusters
    var thrusters = find(data.structure, 'Thrusters');
    $('#' + column + 'Thrusters').text(
        (thrusters.value.model == null ? 'N/A' : (thrusters.multiplier + 'x ' + thrusters.value.model))
    );

    // Shield
    var shield = find(data.structure, 'Shield');
    $('#' + column + 'Shield').text(
        (shield.value.model == null ? 'N/A' : (shield.multiplier + 'x ' + shield.value.model))
    );

    // Factory power plant
    var factoryPowerPlant = find(data.structure, 'Factory power plant');
    $('#' + column + 'FactoryPowerPlant').text(
        (factoryPowerPlant.value.model == null ? 'N/A' : (factoryPowerPlant.multiplier + 'x ' + factoryPowerPlant.value.model))
    );

    // Additional
    var additional = find(misc, 'Additional');
    $('#' + column + 'Additional').text(
        (additional.length === 0 ? 'Nothing' : additional.value.map(function(value) {
            return value.name;
        }).join(', '))
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

    var engineOneValue = (Math.max(engineOne.value.size, 1) * Math.max(engineOne.value.rating, 1) * engineOne.multiplier);
    var engineTwoValue = (Math.max(engineTwo.value.size, 1) * Math.max(engineTwo.value.rating, 1) * engineTwo.multiplier);

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

                case 1: value = (
                        'The ' + shipOne.name + ' has <span class="yellow">' + engineOne.multiplier + ' engines</span> with a '
                        + '<span class="yellow">rating of ' + engineOne.value.rating + '</span> and a <span class="yellow">size of ' + engineOne.value.size + '</span>.'
                        + '<br />'
                        + 'This results in a <span class="yellow">' + (engineOneValue / engineTwoValue).toFixed(2) + 'x</span> higher <span class="yellow">score (' + engineOneValue + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + engineTwoValue + ')</span>.'
                    );
                    break;

                case 2: value = (
                        'The ' + shipTwo.name + ' has <span class="yellow">' + engineTwo.multiplier + ' engines</span> with a '
                        + '<span class="yellow">rating of ' + engineTwo.value.rating + '</span> and a <span class="yellow">size of ' + engineTwo.value.size + '</span>.'
                        + '<br />'
                        + 'This results in a <span class="yellow">' + (engineTwoValue / engineOneValue).toFixed(2) + 'x</span> higher <span class="yellow">score (' + engineTwoValue + ')</span> than <span class="yellow">' + shipOne.name + '\'s score (' + engineOneValue + ')</span>.'
                    );
                    break;

            }

            value += (
                '<br /><br />'
                + 'Equation: enginesSize * enginesRating * enginesMultiplier'
            );

            return value;

        }
    );

    // Compare Thrusters
    var thrustersOne = find(shipOne.structure, 'Thrusters');
    var thrustersTwo = find(shipTwo.structure, 'Thrusters');

    var thrustersValueOne = (Math.max(thrustersOne.value.size, 1) * Math.max(thrustersOne.value.rating, 1) * thrustersOne.multiplier);
    var thrustersValueTwo = (Math.max(thrustersTwo.value.size, 1) * Math.max(thrustersTwo.value.rating, 1) * thrustersTwo.multiplier);
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

                case 1: value = (
                        'The ' + shipOne.name + ' has <span class="yellow">' + thrustersOne.multiplier + ' thrusters</span> with a '
                        + '<span class="yellow">rating of ' + thrustersOne.value.rating + '</span> and a <span class="yellow">size of ' + thrustersOne.value.size + '</span>.'
                        + '<br />'
                        + 'This results in a <span class="yellow">' + (thrustersValueOne / thrustersValueTwo).toFixed(2) + 'x</span> higher <span class="yellow">score (' + thrustersValueOne + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + thrustersValueTwo + ')</span>.'
                    );
                    break;

                case 2: value = (
                        'The ' + shipTwo.name + ' has <span class="yellow">' + thrustersTwo.multiplier + ' thrusters</span> with a '
                        + '<span class="yellow">rating of ' + thrustersTwo.value.rating + '</span> and a <span class="yellow">size of ' + thrustersTwo.value.size + '</span>.'
                        + '<br />'
                        + 'This results in a <span class="yellow">' + (thrustersValueTwo / thrustersValueOne).toFixed(2) + 'x</span> higher <span class="yellow">score (' + thrustersValueTwo + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + thrustersValueOne + ')</span>.'
                    );
                    break;

            }

            value += (
                '<br /><br />'
                + 'Equation: thrustersSize * thrustersRating * thrustersMultiplier'
            );

            return value;

        }
    );

    // Compare Shield
    var shieldOne = find(shipOne.structure, 'Shield');
    var shieldTwo = find(shipTwo.structure, 'Shield');

    var shieldOneValue = (Math.max(shieldOne.value.size, 1) * shieldOne.multiplier + shieldOne.value.maxSize);
    var shieldTwoValue = (Math.max(shieldTwo.value.size, 1) * shieldTwo.multiplier + shieldTwo.value.maxSize);

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

                case 1: value = (
                        'The ' + shipOne.name + ' has <span class="yellow">' + shieldOne.multiplier + ' shields</span> with a '
                        + '<span class="yellow">max. size of ' + shieldOne.value.maxSize + '</span> and a <span class="yellow">size of ' + shieldOne.value.size + '</span>.'
                        + '<br />'
                        + 'This results in a <span class="yellow">' + (shieldOneValue / shieldTwoValue).toFixed(2) + 'x</span> higher <span class="yellow">score (' + shieldOneValue + ')</span> than <span class="yellow">' + shipTwo.name + '\'s score (' + shieldTwoValue + ')</span>.'
                    );
                    break;

                case 2: value = (
                        'The ' + shipTwo.name + ' has <span class="yellow">' + shieldTwo.multiplier + ' shields</span> with a '
                        + '<span class="yellow">max. size of ' + shieldTwo.value.maxSize + '</span> and a <span class="yellow">size of ' + shieldTwo.value.size + '</span>.'
                        + '<br />'
                        + 'This results in a <span class="yellow">' + (shieldTwoValue / shieldOneValue).toFixed(2) + 'x</span> higher <span class="yellow">score (' + shieldTwoValue + ')</span> than <span class="yellow">' + shipOne.name + '\'s score (' + shieldOneValue + ')</span>.'
                    );
                    break;

            }

            value += (
                '<br /><br />'
                + 'Equation: shieldsSize * shieldsMultiplier + shieldsMaxSize'
            );

            return value;

        }
    );

    // Compare Factory power plants
    var factoryPowerPlantOne = find(shipOne.structure, 'Factory power plant');
    var factoryPowerPlantTwo = find(shipTwo.structure, 'Factory power plant');

    var factoryPowerPlantOneValue = (Math.max(factoryPowerPlantOne.value.size, 1) * factoryPowerPlantOne.multiplier + factoryPowerPlantOne.value.maxSize);
    var factoryPowerPlantTwoValue = (Math.max(factoryPowerPlantTwo.value.size, 1) * shieldTwo.multiplier + factoryPowerPlantTwo.value.maxSize);

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

                case 1: value = (
                        'The ' + shipOne.name + '\'s power plant is <span class="yellow">' + (factoryPowerPlantOneValue / factoryPowerPlantTwoValue).toFixed(2) + 'x as powerful</span> as ' + shipTwo.name + '\'s.'
                    );
                    break;

                case 2: value = (
                        'The ' + shipTwo.name + '\'s power plant is <span class="yellow">' + (factoryPowerPlantTwoValue / factoryPowerPlantOneValue).toFixed(2) + 'x as powerful</span> as ' + shipOne.name + '\'s.'
                    );
                    break;

            }

            value += (
                '<br /><br />'
                + 'Equation: powerPlantsSize * powerPlantsMultiplier + powerPlantsMaxSize'
            );

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
