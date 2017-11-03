/**
# remove-with-style

Usage:

    removeWithStyle(elt, class_name, delay_ms);
    removeWithStyle(elt, inline_styles_obj, 2000);

Examples:

    removeWithStyle(elt, 'fade-out', 2000);

Applies the class to the element, sets pointer-events: none, and
then, after the stipulated delay, removes the element.

    removeWithStyle(elt, {opacity: 0}, 2000);

Applies the inline styles to the object, sets pointer-events: none,
if no transition is supplied, a transition of ease-out with the same
time as stipulated is appled, and then the element is removed.
*/
/* global module */
'use strict';

const removeWithStyle = (elt, style, delay_ms) => {
  if (style && style.constructor === Object) {
    Object.keys(style).forEach(prop => {
      elt.style[prop] = style[prop];
      if (!style.transition) {
        elt.style.transition = `ease-out ${(delay_ms * 0.001).toFixed(2)}s`;
      }
    });
  } else {
    elt.classList.add(style);
  }
  elt.style.pointerEvents = 'none';

  // setTimeout is simpler and more reliable than transitionend
  setTimeout(() => {
    elt.remove();
  }, delay_ms);
};

module.exports = removeWithStyle;