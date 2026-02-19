function replaceTokens(text, personalization) {
  if (!text) return "";
  const name = personalization?.name ?? "";
  const date = personalization?.date ?? "";
  return String(text)
    .replaceAll("{NAME}", name)
    .replaceAll("{DATE}", date);
}

module.exports = { replaceTokens };
