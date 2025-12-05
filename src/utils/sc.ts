/**
 * Tailwind Composer
 * @param classNames
 * @returns
 */
export const sc = (
  ...classNames: (string | (() => string) | (boolean | string))[]
) => {
  return classNames
    .map((className) => {
      if (typeof className === "string") {
        return className;
      }
      if (typeof className === "function") {
        return className();
      }
      if (typeof className === "boolean" && className === false) {
        return "";
      }
    })
    .join(" ");
};
