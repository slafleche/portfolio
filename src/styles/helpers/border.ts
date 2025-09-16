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
    color = colorVars.border,
    width = borderVars.width,
    style = borderVars.style,
    radius = borderVars.radius,
  } = props;

  // If border-style: "none"; bypass the rest
  const finalBorder: IFinalBorder = {
    borderStyle: style,
  };

  if (style != 'none') {
    if (width) {
      finalBorder.borderWidth = width.css() as CSS.Property.BorderWidth;
    } else {
      finalBorder.borderWidth = borderVars.width.css();
    }

    if (radius && radius.value != 0) {
      finalBorder.borderRadius = radius.css() as CSS.Property.BorderRadius;
    }
    return {
      ...finalBorder,
      borderColor: color,
    };
  } else {
    return { border: 'none' };
  }
};

export default borders;
