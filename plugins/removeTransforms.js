'use strict';

exports.type = 'perItem';

exports.active = true;

exports.description = 'collapses multiple transformations and optimizes it';

var elementProperties = {
    circle: ['cx', 'cy'],
    ellipse: ['cx', 'cy'],
    line: [['x1', 'x2'], ['y1', 'y1']],
    linearGradient: [['x1', 'x2'], ['y1', 'y1']],
    rect: ['x', 'y'],
    text: ['x', 'y'],
    use: ['x', 'y'],
    image: ['x', 'y']
};

exports.fn = function(item, params) {
	if (
        item.elem &&
        item.hasAttr('transform') &&
        elementProperties.hasOwnProperty(item.elem)
    ) {
		convertTransform(item, params);
	}
};

var transform2js = require('./_transforms.js').transform2js,
    elems = require('./_collections.js').elems;


/**
 * Main function.
 *
 * @param {Object} item input item
 */
function convertTransform(item) {
    var transforms = transform2js(item.attr('transform').value);
    // params = definePrecision(transforms, params);

    for (let transform of transforms) {
        if (transform.name === 'translate') {
            var currentCoordinates = getCoordinates(item);

            for (var i = 0; i < transform.data.length; i++) {
                var currentTranslate = transform.data[i];

                var attributeNames = elementProperties[item.elem];

                if(item.hasAttr(attributeNames[i])){
                    item.attr(attributeNames[i]).value = currentCoordinates[i] + currentTranslate;
                } else {
                    item.addAttr({
                        name: attributeNames[i],
                        value: currentCoordinates[i] + currentTranslate,
                        prefix: '',
                        local: attributeNames[i]
                    });
                }
            }
        }
    }

    // remove supported (only translate) from transform
    item.attr('transform').value = item.attr('transform').value.replace(/translate\(.+?\)/g, '');

		if(item.attr('transform').value == ''){
      item.removeAttr('transform');
    }
}

function getCoordinates(item) {
    var x, y, elem = item.elem;
    var attributeNames = elementProperties[elem];

    if(item.hasAttr(attributeNames[0])){
        x = parseFloat(item.attr(attributeNames[0]).value);
    } else {
        x = parseFloat(elems[elem].defaults[attributeNames[0]]);
    }

    if(item.hasAttr(attributeNames[1])){
        y = parseFloat(item.attr(attributeNames[1]).value);
    } else {
        y = parseFloat(elems[elem].defaults[attributeNames[1]]);
    }

    return [x, y];
}