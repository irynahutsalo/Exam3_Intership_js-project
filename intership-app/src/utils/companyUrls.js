// Convert a company name into a readable URL segment.
export const getCompanySlug = (company) => {
  const name = company.slug ||
    company.brandName ||
    company['name (source / legal)'] ||
    ''

  return String(name)
    .trim()
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/&/g, ' and ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}