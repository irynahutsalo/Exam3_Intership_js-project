// Convert a company name into a stable, readable, URL-safe slug.
// Transliteration keeps Danish characters usable in browser paths.
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