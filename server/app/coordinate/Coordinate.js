/******************************************************************************
 * Copyright (c) Dworek 2016. All rights reserved.                            *
 *                                                                            *
 * @author Tim Visee                                                          *
 * @website http://timvisee.com/                                              *
 *                                                                            *
 * Open Source != No Copyright                                                *
 *                                                                            *
 * Permission is hereby granted, free of charge, to any person obtaining a    *
 * copy of this software and associated documentation files (the "Software"), *
 * to deal in the Software without restriction, including without limitation  *
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,   *
 * and/or sell copies of the Software, and to permit persons to whom the      *
 * Software is furnished to do so, subject to the following conditions:       *
 *                                                                            *
 * The above copyright notice and this permission notice shall be included    *
 * in all copies or substantial portions of the Software.                     *
 *                                                                            *
 * You should have received a copy of The MIT License (MIT) along with this   *
 * program. If not, see <http://opensource.org/licenses/MIT/>.                *
 ******************************************************************************/

var _ = require('lodash');

/**
 * Coordinate class.
 *
 * @param {Object} raw Raw input object. Must contain latitude and longitude property.
 *
 * @class
 * @constructor
 */
var Coordinate = function(raw) {
    /**
     * Latitude.
     * @type {Number}
     */
    this.latitude = raw.latitude;

    /**
     * Longitude.
     * @type {Number}
     */
    this.longitude  = raw.longitude;
};

/**
 * Parse a raw location.
 *
 * @param {Object} raw Raw location object.
 * @return {Coordinate|null} Coordinate or null if parsing failed.
 */
Coordinate.parse = function(raw) {
    // Make sure the object contains the required properties
    if(!raw.hasOwnProperty('latitude') || !raw.hasOwnProperty('longitude'))
        return null;

    // Make sure both are numbers
    if(!_.isNumber(raw.latitude) || !_.isNumber(raw.longitude))
        return null;

    // Create a coordinate object, and return it
    return new Coordinate(raw);
};
