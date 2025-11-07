import type * as CSS from 'csstype';
import { margins } from './spacing.helper';
import { m } from '../measurementKit';
import type { SpacingValue } from './types.helper';
export const absolutePosition = {
  topRight: (
    top: SpacingValue = m(0),
    right: SpacingValue = m(0),
  ) => {
    return {
      position: 'absolute' as CSS.Property.Position,
      top,
      right,
    };
  },
  topLeft: (top: SpacingValue = m(0), left: SpacingValue = m(0)) => {
    return {
      position: 'absolute' as CSS.Property.Position,
      top,
      left,
    };
  },
  bottomRight: (
    bottom: SpacingValue = m(0),
    right: SpacingValue = m(0),
  ) => {
    return {
      position: 'absolute' as CSS.Property.Position,
      bottom,
      right,
    };
  },
  bottomLeft: (
    bottom: SpacingValue = m(0),
    left: SpacingValue = m(0),
  ) => {
    return {
      position: 'absolute' as CSS.Property.Position,
      bottom,
      left,
    };
  },
  middle: (shrink: boolean = false) => {
    if (shrink) {
      return {
        position: 'absolute' as CSS.Property.Position,
        display: 'inline-block',
        top: '50%',
        left: '50%',
        right: 'initial',
        bottom: 'initial',
        transform: 'translate(-50%, -50%)',
      };
    } else {
      return {
        position: 'absolute' as CSS.Property.Position,
        display: 'block',
        top: m(0),
        left: m(0),
        right: m(0),
        bottom: m(0),
        maxHeight: '100%',
        maxWidth: '100%',
        ...margins({ all: 'auto' }),
      };
    }
  },
  middleLeft: (left: SpacingValue = m(0)) => {
    return {
      position: 'absolute' as CSS.Property.Position,
      display: 'block',
      top: m(0),
      left,
      bottom: m(0),
      maxHeight: '100%',
      maxWidth: '100%',
      ...margins({
        top: 'auto',
        bottom: 'auto',
      }),
    };
  },
  middleRight: (right: SpacingValue = m(0)) => {
    return {
      position: 'absolute' as CSS.Property.Position,
      display: 'block',
      top: m(0),
      right,
      bottom: m(0),
      maxHeight: '100%',
      maxWidth: '100%',
      ...margins({
        top: 'auto',
        bottom: 'auto',
      }),
    };
  },
  middleBottom: (bottom: SpacingValue = m(0)) => {
    return {
      position: 'absolute' as CSS.Property.Position,
      display: 'block',
      bottom,
      left: m(0),
      right: m(0),
      maxHeight: '100%',
      maxWidth: '100%',
      ...margins({
        horizontal: 'auto',
        vertical: m(0),
      }),
    };
  },
  middleTop: (top: SpacingValue = m(0)) => {
    return {
      position: 'absolute' as CSS.Property.Position,
      display: 'block',
      top,
      left: m(0),
      right: m(0),
      maxHeight: '100%',
      maxWidth: '100%',
      ...margins({
        horizontal: 'auto',
        vertical: m(0),
      }),
    };
  },
  fullSize: () => {
    return {
      display: 'block',
      position: 'absolute' as CSS.Property.Position,
      top: m(0),
      left: m(0),
      width: '100%',
      height: '100%',
    };
  },
};

export const flexPosition = {
  center: (wrap = false) => {
    return {
      display: 'flex' as CSS.Property.Display,
      alignItems: 'center' as CSS.Property.AlignItems,
      justifyContent: 'center' as CSS.Property.JustifyContent,
      flexWrap: (wrap ? 'wrap' : 'nowrap') as CSS.Property.FlexWrap,
    };
  },

  middleLeft: (wrap = false) => {
    return {
      display: 'flex' as CSS.Property.Display,
      alignItems: 'center' as CSS.Property.AlignItems,
      justifyContent: 'flex-start' as CSS.Property.JustifyContent,
      flexWrap: wrap ? 'wrap' : ('nowrap' as CSS.Property.FlexWrap),
    };
  },

  middleRight: (wrap = false) => {
    return {
      display: 'flex' as CSS.Property.Display,
      alignItems: 'center' as CSS.Property.AlignItems,
      justifyContent: 'flex-end' as CSS.Property.JustifyContent,
      flexWrap: wrap ? 'wrap' : ('nowrap' as CSS.Property.FlexWrap),
    };
  },
};

export function flexMiddle() {
  return {
    display: 'flex' as CSS.Property.Flex,
    width: '100%' as CSS.Property.Width,
    height: '100%' as CSS.Property.Height,
    justifyContent: 'center' as CSS.Property.JustifyContent,
    alignItems: 'center' as CSS.Property.AlignItems,
  };
}

export function fullSizeOfParent() {
  return {
    position: 'absolute' as CSS.Property.Position,
    display: 'block' as CSS.Property.Display,
    top: m(0) as SpacingValue,
    left: m(0) as SpacingValue,
    width: '100%' as CSS.Property.Width,
    height: '100%' as CSS.Property.Height,
  };
}

export function inheritHeight() {
  return {
    display: 'flex' as CSS.Property.Display,
    flexDirection: 'column' as CSS.Property.FlexDirection,
    flexGrow: 1 as CSS.Property.FlexGrow,
    position: 'relative' as CSS.Property.Position,
  };
}
