import * as CSS from 'csstype';

interface IAdvancedSpacing {
  all?: CSS.Property.PaddingTop;
  horizontal?: CSS.Property.PaddingTop;
  vertical?: CSS.Property.PaddingTop;
  top?: CSS.Property.PaddingTop;
  right?: CSS.Property.PaddingTop;
  bottom?: CSS.Property.PaddingTop;
  left?: CSS.Property.PaddingTop;
}

// Besides the name of the prop, there's no difference between "padding" and "margin". This is the generic function.
const spacing = (props?: IAdvancedSpacing) => {
  const {
    all = 0,
    horizontal,
    vertical,
    top,
    right,
    bottom,
    left,
  } = props || {};

  let topSpacing = all;
  let rightSpacing = all;
  let bottomSpacing = all;
  let leftSpacing = all;

  if (horizontal) {
    rightSpacing = horizontal;
    leftSpacing = horizontal;
  }

  if (vertical) {
    topSpacing = vertical;
    bottomSpacing = vertical;
  }

  if (top) {
    topSpacing = top;
  }

  if (right) {
    rightSpacing = right;
  }

  if (bottom) {
    bottomSpacing = bottom;
  }

  if (left) {
    leftSpacing = left;
  }

  const verticalSymmetry = topSpacing === bottomSpacing;
  const horizontalSymmetry = leftSpacing === rightSpacing;

  if (verticalSymmetry && horizontalSymmetry) {
    if (topSpacing === leftSpacing) {
      // all same border
      return topSpacing;
    } else {
      // Vertical symmetry and horizontal symmetry, but not same value
      return `${topSpacing} ${rightSpacing}`;
    }
  }
  return `${topSpacing} ${rightSpacing} ${bottomSpacing} ${leftSpacing}`;
};

export const paddings = (props?: IAdvancedSpacing) => {
  return {
    padding: spacing(props),
  };
};

export const margins = (props?: IAdvancedSpacing) => {
  return {
    margin: spacing(props),
  };
};
