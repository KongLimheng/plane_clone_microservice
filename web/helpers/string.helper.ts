/**
 * @returns {boolean} true if email is valid, false otherwise
 * @description Returns true if email is valid, false otherwise
 * @param {string} email string to check if it is a valid email
 * @example checkEmailIsValid("hello world") => false
 * @example checkEmailIsValid("example@plane.so") => true
 */
export const checkEmailValidity = (email: string): boolean => {
  if (!email) return false;

  const isEmailValid =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );

  return isEmailValid;
};

export const checkURLValidity = (url: string): boolean => {
  if (!url) return false;

  // regex to support complex query parameters and fragments
  const urlPattern =
    /^(https?:\/\/)?((([a-z\d-]+\.)*[a-z\d-]+\.[a-z]{2,6})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(:\d+)?(\/[\w.-]*)*(\?[^#\s]*)?(#[\w-]*)?$/i;

  return urlPattern.test(url);
};

/**
 * @returns {boolean} true if searchQuery is substring of text in the same order, false otherwise
 * @description Returns true if searchQuery is substring of text in the same order, false otherwise
 * @param {string} text string to compare from
 * @param {string} searchQuery
 * @example substringMatch("hello world", "hlo") => true
 * @example substringMatch("hello world", "hoe") => false
 */
export const substringMatch = (text: string, searchQuery: string): boolean => {
  try {
    let searchIndex = 0;

    for (let i = 0; i < text.length; i++) {
      if (text[i].toLowerCase() === searchQuery[searchIndex]?.toLowerCase()) searchIndex++;

      // All characters of searchQuery found in order
      if (searchIndex === searchQuery.length) return true;
    }

    // Not all characters of searchQuery found in order
    return false;
  } catch (error) {
    return false;
  }
};

const fallbackCopyTextToClipboard = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    // FIXME: Even though we are using this as a fallback, execCommand is deprecated 👎. We should find a better way to do this.
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
    document.execCommand("copy");
  } catch (err) {
    // catch fallback error
    console.error(err, "from copyTextToClipboard");
  }

  document.body.removeChild(textArea);
};

export const copyTextToClipboard = async (text: string) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  await navigator.clipboard.writeText(text);
};

/**
 * @description: This function copies the url to clipboard after prepending the origin URL to it
 * @param {string} path
 * @example:
 * const text = copyUrlToClipboard("path");
 * copied URL: origin_url/path
 */
export const copyUrlToClipboard = async (path: string) => {
  const originUrl = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";

  await copyTextToClipboard(`${originUrl}/${path}`);
};

export const replaceUnderscoreIfSnakeCase = (str: string) => str.replace(/_/g, " ");
export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const generateRandomColor = (string: string): string => {
  if (!string) return "rgb(var(--color-primary-100))";

  string = `${string}`;

  const uniqueId = string.length.toString() + string; // Unique identifier based on string length
  const combinedString = uniqueId + string;

  const hash = Array.from(combinedString).reduce((acc, char) => {
    const charCode = char.charCodeAt(0);
    return (acc << 5) - acc + charCode;
  }, 0);

  const hue = hash % 360;
  const saturation = 70; // Higher saturation for pastel colors
  const lightness = 60; // Mid-range lightness for pastel colors

  const randomColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  return randomColor;
};
