// Translate normalized field slugs from the data file into labels shown to users.
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

// Map user-facing programme names to the source codes used in company records.
const programmeCodes = {
  'Multimedia Design': 'multimediedesigner',
  'Datamatiker / Computer Science': 'datamatiker'
}

// Define which internship fields are relevant to each supported programme.
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

// Convert arrays or delimited strings into trimmed, lowercase values.
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
// Return readable, unique internship fields for one company.
export const getCompanyFields = (company) => {
  const codes = splitValues(
    company['internshipFieldSlugs (optional)']
  )

  if (codes.length === 0) return ['Other']

  return [...new Set(
    codes.map(code => fieldLabels[code] || code)
  )]
}

// Keep programme matching consistent across the home and companies pages.
export const matchesStudyProgramme = (company, programme) => {
  if (!programme || programme === 'All programmes') return true

  const code = programmeCodes[programme] || programme.toLowerCase()

  return splitValues(company.sourceProgrammes).includes(code)
}

// Build the checkbox list from fields that actually exist in matching records.
export const getAvailableFields = (companies, programme) => {
  const existingFields = new Set()

  // First collect the fields present in the current data set.
  companies
    .filter(company => matchesStudyProgramme(company, programme))
    .forEach(company => {
      getCompanyFields(company).forEach(field => {
        existingFields.add(field)
      })
    })

  // Without a programme filter, expose every discovered field.
  if (!programme || programme === 'All programmes') {
    const fields = [...existingFields]
      .filter(field => field !== 'Other')
      .sort((a, b) => a.localeCompare(b))

    if (existingFields.has('Other')) {
      fields.push('Other')
    }

    return fields
  }

  // With a programme selected, retain only fields relevant to it.
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