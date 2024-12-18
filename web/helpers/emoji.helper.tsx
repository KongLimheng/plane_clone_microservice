export const getRandomEmoji = () => {
  const emojis = [
    "8986",
    "9200",
    "128204",
    "127773",
    "127891",
    "127947",
    "128076",
    "128077",
    "128187",
    "128188",
    "128512",
    "128522",
    "128578",
  ];

  return emojis[Math.floor(Math.random() * emojis.length)];
};

export const convertHexEmojiToDecimal = (emojiUnified: string): string => {
  if (!emojiUnified) return "";

  return emojiUnified
    .split("-")
    .map((e) => parseInt(e, 16))
    .join("-");
};

export const emojiCodeToUnicode = (emoji: string) => {
  if (!emoji) return "";

  // convert emoji code to unicode
  const uniCodeEmoji = emoji
    .split("-")
    .map((emoji) => parseInt(emoji, 10).toString(16))
    .join("-");

  return uniCodeEmoji;
};
