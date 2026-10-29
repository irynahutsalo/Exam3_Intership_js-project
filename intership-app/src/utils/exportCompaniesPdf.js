import jsPDF from 'jspdf'

// Create the same PDF from the current results and filters.
export const exportCompaniesPdf = (companies, activeFilters, searchQuery) => {
  if (!companies.length) return

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const red = [217, 0, 27]
  const ink = [17, 24, 32]
  const muted = [95, 103, 112]
  const paper = [250, 247, 239]
  const border = [224, 225, 227]

  const margin = 16
  const width = 178
  const bottom = 278
  const lineHeight = 4.5

  const date = new Date().toLocaleDateString('en-GB')
  let y = 0

  const programmeLabels = {
    datamatiker: 'Datamatiker / Computer Science',
    multimediedesigner: 'Multimedia Design',
  }

  const languageLabels = {
    en: 'English',
    english: 'English',
    dk: 'Danish',
    da: 'Danish',
    danish: 'Danish',
  }

  const displayValue = (value) => {
    const text = String(value ?? '').trim()
    return text || 'Not provided'
  }

  const websiteLink = (value) => {
    if (!value) return undefined

    try {
      const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)

      return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined
    } catch {
      return undefined
    }
  }

  const drawPageHeader = (firstPage = false) => {
    doc.setFillColor(...red)
    doc.rect(0, 0, 210, 3, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...ink)
    doc.text('FIND YOUR INTERNSHIP', margin, 14)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...muted)
    doc.text(date, 194, 14, { align: 'right' })

    doc.setDrawColor(...border)
    doc.line(margin, 19, 194, 19)

    y = 29

    if (firstPage) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.setTextColor(...ink)
      doc.text('Your company list', margin, y + 4)

      y += 14

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...muted)
      doc.text(`${companies.length} companies matching your search`, margin, y)

      y += 9
    }
  }

  const newPage = () => {
    doc.addPage()
    drawPageHeader()
  }

  const ensureSpace = (height) => {
    if (y + height > bottom) newPage()
  }

  const drawText = (text, size = 10, color = ink) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)

    const lines = doc.splitTextToSize(text, width)

    lines.forEach((line) => {
      ensureSpace(lineHeight)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(size)
      doc.setTextColor(...color)
      doc.text(line, margin, y)

      y += lineHeight
    })
  }

  const drawRow = (label, value, link) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)

    const lines = doc.splitTextToSize(displayValue(value), width - 38)

    lines.forEach((line, index) => {
      ensureSpace(lineHeight)

      if (index === 0) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...muted)
        doc.text(label, margin, y)
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(...(link ? red : ink))
      doc.text(line, margin + 38, y)

      if (link) {
        doc.link(margin + 38, y - 3.5, doc.getTextWidth(line), lineHeight, { url: link })
      }

      y += lineHeight
    })

    y += 2
  }

  drawPageHeader(true)

  const filterLabels = activeFilters.map((filter) => filter.label)

  if (searchQuery.trim()) {
    filterLabels.push(`Name: ${searchQuery.trim()}`)
  }

  drawText(
    filterLabels.length ? `Filters: ${filterLabels.join(' / ')}` : 'Filters: All companies',
    9,
    muted,
  )

  y += 3

  drawText(
    'Check company websites for current internship opportunities. Contact details may change.',
    9,
    muted,
  )

  y += 8

  companies.forEach((company, index) => {
    const programmes = company.sourceProgrammes
      .map((programme) => {
        return programmeLabels[programme.toLowerCase()] || programme
      })
      .join(', ')

    const languages = company.websiteLanguages
      .map((language) => {
        return languageLabels[language.toLowerCase()] || language
      })
      .join(', ')

    const rows = [
      ['Study programme', programmes],
      ['City', company.city],
      ['Address', company.address],
      ['Website', company.website, websiteLink(company.website)],
      [
        'Email',
        company.email,
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email) ? `mailto:${company.email}` : undefined,
      ],
      ['Phone', company.phone],
      ['Website language', languages],
    ]

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)

    const titleLines = doc.splitTextToSize(
      `${index + 1}. ${displayValue(company.brandName)}`,
      width - 12,
    )

    const titleHeight = titleLines.length * 6 + 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    const descriptionHeight = company.description
      ? doc.splitTextToSize(company.description, width).length * lineHeight + 4
      : 0

    doc.setFontSize(9.5)

    const rowsHeight = rows.reduce((height, row) => {
      const lines = doc.splitTextToSize(displayValue(row[1]), width - 38)
      return height + lines.length * lineHeight + 2
    }, 0)

    const blockHeight = titleHeight + 7 + descriptionHeight + rowsHeight + 8

    // Keep each company together when it fits on a fresh page.
    if (blockHeight <= bottom - 29) {
      ensureSpace(blockHeight)
    } else {
      ensureSpace(titleHeight + 20)
    }

    doc.setFillColor(...paper)
    doc.roundedRect(margin, y, width, titleHeight, 2, 2, 'F')

    doc.setFillColor(...red)
    doc.rect(margin, y, 1.2, titleHeight, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...ink)

    titleLines.forEach((line, lineIndex) => {
      doc.text(line, margin + 6, y + 7 + lineIndex * 6)
    })

    y += titleHeight + 7

    if (company.description) {
      drawText(company.description)
      y += 4
    }

    rows.forEach(([label, value, link]) => {
      drawRow(label, value, link)
    })

    ensureSpace(8)

    doc.setDrawColor(...border)
    doc.line(margin, y, 194, y)
    y += 8
  })

  const pageCount = doc.getNumberOfPages()

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)

    doc.setDrawColor(...border)
    doc.line(margin, 284, 194, 284)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...muted)

    doc.text('Find Your Internship / Company directory', margin, 290)
    doc.text(`${page} / ${pageCount}`, 194, 290, { align: 'right' })
  }

  doc.save('find-your-internship-companies.pdf')
}
