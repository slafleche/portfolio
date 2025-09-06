import * as csstype from 'csstype';

import { measurement } from './measurement';
import { borderVars, colors, IBorder } from '../vars.css';

interface IFinalBorder {
  borderColor?: csstype.Property.BorderColor;
  borderWidth?: csstype.Property.BorderWidth;
  borderStyle?: csstype.Property.BorderStyle;
  borderRadius?: csstype.Property.BorderRadius;
}

const borders = (props: IBorder = {}) => {
  const {
    color = colors.border,
    width = borderVars.width,
    style = borderVars.style,
    radius = borderVars.radius,
  } = props;

  const borderProps: IFinalBorder = {
    borderStyle: style,
  };

  if (style != 'none') {
    borderProps.borderColor = color.css();
    borderProps.borderWidth = measurement(width || borderVars.width).toString();
    if (radius) {
      const rad = measurement(radius);
      if (rad.val != 0) {
        borderProps.borderRadius = rad.toString();
      }
    }
    return borderProps;
  } else {
    return { border: 'none' };
  }
};

export default borders;
