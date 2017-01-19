/**
 * Properties for framework customization
 * @namespace Configuration
 * @property {string} resModType=integer - Determines if integers or percentages are
 *                    used for resource modifications. Accepts 'integer' and
 *                    'percent'.
 * @property {string} attrModType=integer - Determines if integers or percentages are
 *                    used for attribute modifications. Accepts 'integer' and
 *                    'percent'.
 * @property {boolean} addResourceDiff=true - Determines if positive changes to a resource
 *                     are added to the current value after a modification is applied.
 * @property {Object} unitProperties - An object containing the name and type of each
 *                    each property that is initialized on the creation of a new unit.
 */
module.exports = {
  resModType: 'integer',
  attrModType: 'integer',
  addResourceDiff: true,
  unitProperties: []
};