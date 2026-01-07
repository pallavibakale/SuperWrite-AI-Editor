export function getSelectionInfo(state) {
  const { selection, doc } = state;
  const { from, to, empty } = selection;

  if (empty) {
    return { isValid: false, reason: "Selection is empty." };
  }

  const $from = selection.$from;
  const $to = selection.$to;

  if (!$from.sameParent($to)) {
    return {
      isValid: false,
      reason: "Selection must be within a single block.",
    };
  }

  const parentNode = $from.parent;

  if (!parentNode.isTextblock) {
    return { isValid: false, reason: "Selection must be text." };
  }

  const textContent = doc.textBetween(from, to, " ");

  if (!textContent.trim()) {
    return { isValid: false, reason: "Selected text is empty whitespace." };
  }

  return {
    isValid: true,
    nodeType: parentNode.type.name,
    textContent,
    from,
    to,
  };
}
