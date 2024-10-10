export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const escapeRegex = (text: string): string => {
  return text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const parseSortParam = (sortParam: string): Record<string, number> => {
  const sortFields = sortParam.split(',');
  const sortObj: Record<string, number> = {};

  sortFields.forEach((field) => {
    if (field.startsWith('-')) {
      const fieldName = field.substring(1);
      sortObj[fieldName] = -1;
    } else {
      sortObj[field] = 1;
    }
  });

  return sortObj;
};
