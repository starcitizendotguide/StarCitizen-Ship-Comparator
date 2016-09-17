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
              source: autocomplete.sources.hits(index, {hitsPerPage: 1}),
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

        setValues('one', $.parseJSON(suggestion.value));
    });


    autocomplete(
        '#shipTwoSearch',
        {
            hint: true
        },
        [
            {
              source: autocomplete.sources.hits(index, {hitsPerPage: 1}),
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
        console.log($.parseJSON(suggestion.value));
        setValues('two', $.parseJSON(suggestion.value));
    });

});

function setValues(column, data) {

    var misc = find(data.structure, 'Miscellaneous').value;

    // Manufacturer
    $('#' + column + 'Manufacturer').text(data.manufacturer.name + ' (' + data.manufacturer.code + ')');

    // Focus
    $('#' + column + 'Focus').text(data.focus);

    // Dimension
    $('#' + column + 'Dimension').text(data.dimension.length + 'm x ' + data.dimension.beam + 'm x ' + data.dimension.height + 'm');

    // Null-Cargo Mass
    $('#' + column + 'NullCargoMass').text(data.mass.null_cargo + ' Kg');

    // Cargo Capacity
    $('#' + column + 'CargoCapacity').text(
        find(misc, 'Cargo capacity').value
    );

    // Max Crew
    $('#' + column + 'MaxCrew').text(
        find(misc, 'Max crew').value + ' people'
    );

    // Engine
    var engine = find(data.structure, 'Engine');
    $('#' + column + 'Engine').text(
        engine.multiplier + 'x ' + engine.value
    );

    // Thrusters
    var thrusters = find(data.structure, 'Thrusters');
    $('#' + column + 'Thrusters').text(
        thrusters.multiplier + 'x ' + thrusters.value
    );

    // Shield
    var shield = find(data.structure, 'Shield'); // TODO: It's currently empty, but the name should be "Model" or something comparebale...
    $('#' + column + 'Shield').text(
        shield.multiplier + 'x ' + shield.value
    );

    // Factory power plant
    var factoryPowerPlant = find(misc, 'Factory power plant');
    $('#' + column + 'FactoryPowerPlant').text(
        factoryPowerPlant.multiplier + 'x ' + factoryPowerPlant.value
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
