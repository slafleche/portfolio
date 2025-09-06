import { style } from "@vanilla-extract/css";
import * as csstype from "csstype";

export interface IBackground {
  color?: csstype.Property.BackgroundColor;
  attachment?: csstype.Property.BackgroundAttachment;
  position?: csstype.Property.Position;
  repeat?: csstype.Property.BackgroundRepeat;
  size?: csstype.Property.BackgroundSize;
  image?: csstype.Property.BackgroundImage;
  fallbackImage?: csstype.Property.BackgroundImage;
  opacity?: csstype.Property.Opacity;
}

export const getBackgroundImage = (
  image?: csstype.Property.BackgroundImage,
) => {
  if (!image) {
    return undefined;
  }

  if (image.startsWith("linear-gradient(")) {
    return image;
  }

  // Fallback to a general asset URL.
  return `url(${image})`;
};

export const backgroundHelper = (props: IBackground) => {
  const styles = {
    backgroundPosition: props.position || `50% 50%`,
    backgroundRepeat: props.repeat || "no-repeat",
    backgroundImage: getBackgroundImage(props.image),
  } as any;

  if (props.size) {
    styles.backgroundSize = props.size as csstype.Property.BackgroundSize;
  }

  if (props.color) {
    styles.backgroundColor = props.color as csstype.Property.BackgroundColor;
  }

  if (props.attachment) {
    styles.backgroundAttachment =
      props.attachment as csstype.Property.BackgroundAttachment;
  }

  if (props.opacity) {
    styles.opacity = props.opacity as csstype.Property.Opacity;
  }

  return styles;
};

export const objectFitWithFallback = () => {
  return {
    position: "absolute" as csstype.Property.Position,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    margin: "auto",
    height: "auto",
    width: "100%",
    $nest: {
      "@supports (object-fit: cover)": {
        position: "relative !important",
        objectFit: "cover" as csstype.Property.ObjectFit,
        objectPosition: "center",
        height: "100% !important",
      },
    },
  };
};

export function fakeBackgroundFixed() {
  return {
    content: "",
    display: "block",
    position: "fixed",
    top: "0px",
    left: "0px",
    width: "100vw",
    height: "100vh",
  };
}

export function centeredBackground(image: csstype.Property.BackgroundImage) {
  return {
    backgroundSize: "cover",
    backgroundPosition: `50% 50%`,
    backgroundRepeat: "no-repeat",
    backgroundImage: getBackgroundImage(image),
  };
}
