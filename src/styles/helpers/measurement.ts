// Object representing a CSS measurement (eg. "10px" or "30vh");
export interface IMeasurement {
  value: number;
  unit?: string;
}

// Allows keeping measurement values as a number for easier math,
// and then convert to string for use
export const measurement = (measurement: IMeasurement | number) => {
  let value;
  let unit;

  // Shorthand for simple px values
  if (typeof measurement === 'number') {
    value = measurement;
    unit = 'px';
  } else {
    value = measurement.value;
    unit = measurement.unit || 'px';
  }

  return {
    value,
    unit,
    css: () => {
      return `${value}${unit}`;
    },
  };
};

