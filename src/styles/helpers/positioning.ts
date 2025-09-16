import * as CSS from 'csstype';

export const absolutePosition = {
  topRight: (top: string | number = '0', right: CSS.Property.Right = '0px') => {
    return {
      position: 'absolute' as CSS.Property.Position,
      top,
      right,
    };
  },
  topLeft: (top: string | number = '0px', left: CSS.Property.Left = '0px') => {
    return {
      position: 'absolute' as CSS.Property.Position,
      top,
      left,
    };
  },
  bottomRight: (
    bottom: CSS.Property.Bottom = '0px',
    right: CSS.Property.Right = '0px',
  ) => {
    return {
      position: 'absolute' as CSS.Property.Position,
      bottom,
      right,
    };
  },
  bottomLeft: (
    bottom: CSS.Property.Bottom = '0px',
    left: CSS.Property.Left = '0px',
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: '100%',
        maxWidth: '100%',
        margin: 'auto',
      };
    }
  },
  middleLeft: (left: CSS.Property.Left = '0px') => {
    return {
      position: 'absolute' as CSS.Property.Position,
      display: 'block',
      top: 0,
      left,
      bottom: 0,
      maxHeight: '100%',
      maxWidth: '100%',
      margin: 'auto 0',
    };
  },
  middleRight: (right: CSS.Property.Right = '0px') => {
    return {
      position: 'absolute' as CSS.Property.Position,
      display: 'block',
      top: 0,
      right,
      bottom: 0,
      maxHeight: '100%',
      maxWidth: '100%',
      margin: 'auto 0',
    };
  },
  middleBottom: (bottom: CSS.Property.Bottom = '0px') => {
    return {
      position: 'absolute' as CSS.Property.Position,
      display: 'block',
      bottom,
      left: 0,
      right: 0,
      maxHeight: '100%',
      maxWidth: '100%',
      margin: '0 auto',
    };
  },
  middleTop: (top: CSS.Property.Top = '0px') => {
    return {
      position: 'absolute' as CSS.Property.Position,
      display: 'block',
      top,
      left: 0,
      right: 0,
      maxHeight: '100%',
      maxWidth: '100%',
      margin: '0 auto',
    };
  },
  fullSize: () => {
    return {
      display: 'block',
      position: 'absolute' as CSS.Property.Position,
      top: '0px',
      left: '0px',
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

// export function flexMiddle() {
//   return {
//     display: "flex",
//     width: "100%",
//     height: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//   };
// }

// export function fullSizeOfParent() {
//   return {
//     position: "absolute",
//     display: "block",
//     top: "0px",
//     left: "0px",
//     width: "100%",
//     height: "100%",
//   };
// }

export const inheritHeight = () => {
  return {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    position: 'relative',
  };
};
