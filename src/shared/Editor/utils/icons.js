const createSvgIcon = (path) => {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${path}</svg>`;
};

const editorIcons = {
  alignLeft: createSvgIcon(
    '<path d="M3 21h18v-2H3v2zm0-4h12v-2H3v2zm0-4h18v-2H3v2zm0-4h12v-2H3v2zm0-6v2h18V3H3z"/>',
  ),
  alignCenter: createSvgIcon(
    '<path d="M7 21h10v-2H7v2zm-4-4h18v-2H3v2zm4-4h10v-2H7v2zM3 9h18V7H3v2zm4-4h10V3H7v2z"/>',
  ),
  alignRight: createSvgIcon(
    '<path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12v-2H9v2zM3 3v2h18V3H3z"/>',
  ),
  delete: createSvgIcon(
    '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>',
  ),
};

export { editorIcons };
