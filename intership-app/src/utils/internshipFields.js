// Display names for the field codes used in companies.json.
const fieldLabels = {
  'frontend-development': 'Frontend Development',
  'backend-development': 'Backend Development',
  'software-development': 'Software Development',
  'database-development': 'Database Development',
  'systems-integration': 'Systems Integration',
  'it-operations-support': 'IT Operations & Support',
  'software-testing-qa': 'Software Testing / QA',
  'ux-ui-design': 'UX/UI Design',
  'graphic-design': 'Graphic Design',
  'content-creation': 'Content Creation',
  'social-media': 'Social Media',
  'web-content-cms': 'Web Content / CMS',
  'digital-marketing': 'Digital Marketing',
  other: 'Other'
}

// Programme codes actually present in the current JSON file.
const programmeCodes = {
  'Multimedia Design': 'multimediedesigner',
  'Datamatiker / Computer Science': 'datamatiker'
}

// Fields relevant to each study programme.
const programmeFields = {
  'Multimedia Design': [
    'UX/UI Design',
    'Frontend Development',
    'Graphic Design',
    'Content Creation',
    'Social Media',
    'Web Content / CMS',
    'Digital Marketing'
  ],

  'Datamatiker / Computer Science': [
    'Software Development',
    'Frontend Development',
    'Backend Development',
    'Database Development',
    'Systems Integration',
    'IT Operations & Support',
    'Software Testing / QA'
  ]
}

// Split a source value into separate entries.
const splitValues = (value) => {
  const values = Array.isArray(value) ? value : [value ?? '']

  return values.flatMap(item =>
    String(item)
      .split(/[;,]/)
      .map(part => part.trim().toLowerCase())
      .filter(Boolean)
  )
}

// Read every field assigned to a company.
// An empty value belongs to Other.
export const getCompanyFields = (company) => {
  const codes = splitValues(
    company['internshipFieldSlugs (optional)']
  )

  if (codes.length === 0) return ['Other']

  return [...new Set(
    codes.map(code => fieldLabels[code] || code)
  )]
}

// Use the same programme matching on both pages.
export const matchesStudyProgramme = (company, programme) => {
  if (!programme || programme === 'All programmes') return true

  const code = programmeCodes[programme] || programme.toLowerCase()

  return splitValues(company.sourceProgrammes).includes(code)
}

// Build the checkbox list from companies in the selected programme.
// Show only programme-relevant fields that exist in the company data.
export const getAvailableFields = (companies, programme) => {
  const existingFields = new Set()

  // Collect fields from companies matching the selected programme.
  companies
    .filter(company => matchesStudyProgramme(company, programme))
    .forEach(company => {
      getCompanyFields(company).forEach(field => {
        existingFields.add(field)
      })
    })

  // Without a programme filter, show all fields from the data.
  if (!programme || programme === 'All programmes') {
    const fields = [...existingFields]
      .filter(field => field !== 'Other')
      .sort((a, b) => a.localeCompare(b))

    if (existingFields.has('Other')) {
      fields.push('Other')
    }

    return fields
  }

  // Keep only fields relevant to the selected programme.
  const allowedFields = programmeFields[programme] || []

  const fields = allowedFields.filter(field =>
    existingFields.has(field)
  )

  // Other includes companies whose field value is empty.
  if (existingFields.has('Other')) {
    fields.push('Other')
  }

  return fields
}