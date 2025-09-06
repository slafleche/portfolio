// Object representing a CSS measurement (eg. "10px" or "30vh");
export interface IMeasurement {
  val: number;
  unit: string;
  toString: () => string;
}

export const measurement = (value: string | IMeasurement, newVal?: number) => {
  let valParsed: number;
  let val;
  let unit: string;
  // For easlier type checking, pass through value if it's already converted.
  if (typeof value === "string") {
    // Modify value into object
    val = value.trim();
    unit = val.replace(/^-?(0|[1-9]\d*)?([.][0-9]*)?/, ""); // not yet trimmed
    val = val.substring(0, val.length - unit.length);
    if (val === "-0") {
      val = "0";
    }
    valParsed = Number(val);
    unit = unit.trim();
  } else {
    if (typeof newVal === "number") {
      // Setting new value for measurement
      valParsed = newVal;
      val = value.val;
      unit = value.unit;
    } else {
      // will be IMeasurement, return as is
      return value;
    }
  }

  const result: IMeasurement = {
    val: valParsed,
    unit,
    toString: () => {
      return `${valParsed}${unit}`;
    },
  };

  return result;
};
