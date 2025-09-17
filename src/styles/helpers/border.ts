import * as CSS from 'csstype';

import { borderVars, colorVars, IBorder } from '../vars';

// Final export needs to be css properties, not objects
interface IFinalBorder {
  borderColor?: CSS.Property.BorderColor;
  borderWidth?: CSS.Property.BorderWidth;
  borderStyle?: CSS.Property.BorderStyle;
  borderRadius?: CSS.Property.BorderRadius;
}

const borders = (props: IBorder = {}) => {
  const {
    color = colorVars.border, // Colour
    width = borderVars.width, // Measurement
    style = borderVars.style, // String
    radius = borderVars.radius, // Measurement
  } = props;

  // If border-style: "none"; bypass the rest
  const finalBorder: IFinalBorder = {
    borderStyle: style,
  };

  if (style != 'none') {
    if (!!width) {
      if (typeof width === 'string') {
        finalBorder.borderWidth = width;
      } else {
        finalBorder.borderWidth = width.css();
      }
    } else {
      finalBorder.borderWidth = borderVars.width.css();
    }

    if (radius) {
      if (!!radius) {
        if (typeof radius === 'string') {
          finalBorder.borderRadius = width;
        } else {
          finalBorder.borderRadius = width.css();
        }
      } else {
        finalBorder.borderRadius = borderVars.radius.css();
      }
    }

    if (color) {
      if (!!radius) {
        if (typeof color === 'string') {
          finalBorder.borderColor = color;
        } else {
          finalBorder.borderColor = color.css();
        }
      } else {
        finalBorder.borderColor = borderVars.color.css();
      }
    }

    return {
      ...finalBorder,
      borderStyle: borderStyle,
    };
  } else {
    return { border: 'none' };
  }
};

export default borders;
