# Exam3_Intership_js project

# Find Your Internship

Find Your Internship is a student project built with Vue 3. It helps students find companies in and around Esbjerg, Denmark, and view their contact details.

The starting dataset contains 143 companies. A company in the list does not necessarily have an open internship position. Students should contact the company or check its website.

**Live website:** https://internship-project-js.web.app

## Main features

### For visitors

- Choose an educational institution and study programme.
- Filter companies by city, internship field and website language.
- Search for a company by name.
- View 14 companies per page.
- Remove selected filters or clear the full search.
- Open a company page with contact details and a Careers link when available.
- Return to the company list with the previous search.
- Download the filtered company list as a PDF.
- Print or save company details as a PDF through the browser.
- Use the website on a phone, tablet or computer.

Internship fields depend on the selected study programme. An empty internship field is shown as **Other**. Website language describes the company website; it does not guarantee the working language of an internship.

### For the administrator

- Log in and log out of the demo administration area.
- View and search the company list.
- Add a company.
- Edit company information.
- Change a company's status.
- Delete a company after confirmation.

## Technologies

- Vue 3 and Composition API
- Vue Router
- Tailwind CSS
- Vite
- jsPDF for the company list PDF
- JSON, localStorage and sessionStorage
- Firebase Hosting

## Main project files

| File or folder | Purpose |
| --- | --- |
| `src/views/HomeView.vue` | Home page layout and decorative images |
| `src/components/Home/HeroHeader.vue` | Main heading and introduction |
| `src/components/Home/SearchFilterCard.vue` | Home page search form |
| `src/components/Home/CustomSelect.vue` | Reusable dropdown |
| `src/views/Companies.vue` | Company results, filters, pagination and PDF export |
| `src/views/CompanyDetails.vue` | Company information and contact details |
| `src/views/AdminLogin.vue` | Demo login form |
| `src/views/AdminDashboard.vue` | Company management |
| `src/router/index.js` | Routes and navigation guard |
| `src/utils/internshipFields.js` | Internship field labels and programme matching |
| `src/utils/companyUrls.js` | Readable company names in URLs |
| `src/data/companies.json` | Starting company dataset |
| `public/images/` | Website illustrations |
| `src/utils/exportCompaniesPdf.js
| `src/data/studyProgrammes.js

## Pages and navigation

| Address | Page |
| --- | --- |
| `/` | Home and search |
| `/companies` | Company list |
| `/company/blue-water-shipping` | Example company page |
| `/admin` | Demo administrator login |
| `/admin/dashboard` | Company management |

Company URLs use a readable version of the company name, called a slug. Old links containing a company ID are also supported.

The results page stores selected filters and the page number in URL query parameters. The first page without filters has a clean `/companies` address.

Company pages have clean URLs. The previous list state is saved in `sessionStorage` for the **Back to companies** link in the current tab.

## How data works in this version

This version uses frontend storage. It does not use Appwrite or another shared database.

The JSON file contains the starting company list. The browser can also keep a separate copy under `companies_list` in `localStorage`.

Currently:

- The home page builds its city and internship field options from the JSON file.
- The results page reads companies and cities from the saved browser list when it exists. Otherwise, it uses JSON.
- The results page builds internship field options from JSON.
- Company details and the administration area use the saved browser list when it exists.
- Changes made in the administration area are saved in the current browser.

Editing a company in the administration area does **not** change the JSON file or update the website for other visitors.

Localhost and the published website have separate browser storage. Another browser, another device or a private browsing window also has separate storage.

Updating the JSON file does not automatically replace an older list already saved in a visitor's browser.

## Demo authentication

The administration area uses a frontend login check. A navigation guard checks a flag in `localStorage` before opening the dashboard.

This demonstrates the login flow and protected navigation, but it is **not secure authentication**. A user can change browser storage. There are no backend permissions in this version.

Do not use this approach for private data or a real administration system. Frontend code must not contain real passwords, private keys or server API secrets.

## Current limitations

- Company changes are local to one browser.
- The home page and results page can show different filter options if the saved list differs from JSON.
- The status control exists in the administration area, but public pages do not yet consistently exclude inactive companies.
- Company URLs generated from names can change when a company is renamed. Duplicate names need additional handling.
- Some views contain a large amount of logic. Data handling and PDF export can be moved into separate modules.
- Demo login does not provide server-side protection.

These points describe the current version, rather than planned features.

## Publish an update

Deployment uses Firebase Hosting. It requires Firebase CLI access to the configured project.

From the app folder, build the project:

```bash
npm run build
```

After a successful build, deploy it:

```bash
firebase deploy --only hosting
```

This publishes the website files. It does not publish company changes stored only in your browser.

## Manual checks before submission

- Search from the home page and check the results.
- Test cities, study programmes, internship fields and languages.
- Clear filters and check the URL.
- Open a company, refresh its page and return to the results.
- Check pagination and PDF export.
- Test the demo login and logout.
- Add, edit and delete a test company in the administration area.
- Refresh the page and check that local changes remain.
- Check the website on a phone and a laptop.
- Run the production build and check the published version.

## AI use and reflection

I used ChatGPT to discuss the design, explain Vue code, improve responsive layouts and find errors.

One useful example was changing company URLs from technical IDs to readable company names.

One suggestion needed further review: different pages used JSON and localStorage in different ways. This caused different city lists. I discussed the cause and the limits of local storage before deciding what to change.

AI helped me work through problems step by step. I still needed to compare the code with the project requirements, test the website and understand how the solution worked.
