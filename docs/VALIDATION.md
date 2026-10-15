# Delivery validation

Delivery: 15 October 2026. These results describe checks actually performed on this source package. They are not an assertion that the Next.js application was built, visually reviewed, or tested in a browser.

## Executed checks

| Check | Actual result |
| --- | --- |
| TypeScript/TSX syntax transpilation | **Passed:** 33 files, zero syntax diagnostics. |
| Strict semantic checking of pure domain modules | **Passed:** 7 modules, zero diagnostics. |
| Executed commerce and translation tests | **Passed:** 39 tests, zero failures, zero skipped. |
| Translation coverage | **Passed:** 244 keys in each locale; matching keys and interpolation tokens. |
| CSS syntax parsing | **Passed:** 577 rules and 1,807 declarations. |
| Local source import paths | **Passed:** 130 imports, zero unresolved paths. |
| JavaScript config/script syntax | **Passed:** four files checked with `node --check`. |
| Required image preflight | **Failed as expected:** all 11 original photographs are missing from the supplied inputs. |

The actual unit-test TAP output is in `unit-tests.tap`; machine-readable results are in `validation.json`. The missing-image output is in `asset-preflight.txt`.

## Method and limits

The execution environment provided Node.js 22.16.0 and an existing TypeScript 5.8.3 installation. The project manifest requests TypeScript 5.9 or a compatible later minor release. The offline validation script used the existing 5.8.3 compiler: it transpiled each TS/TSX file for syntax, strictly type-checked the seven dependency-free domain modules against the standard DOM/ES libraries, compiled the domain modules and tests into a temporary CommonJS directory, and executed the resulting tests with Node's test runner. Temporary generated files were removed.

The portable harness is `scripts/offline-validate.cjs`. After normal dependency installation, run it with:

```bash
node scripts/offline-validate.cjs
```

An alternative existing TypeScript installation can be selected through the `TYPESCRIPT_PATH` environment variable. This optional offline harness does **not** replace `npm run typecheck`, the normal `npm test` command, or a Next.js production build.

The stylesheet was parsed with PostCSS 8.5.6. This detects syntax errors, not Tailwind generation, responsive layout, rendered color contrast or browser behavior. Import-path checking resolved only local source files, not external dependency types or APIs.

## Not executed

Registry DNS could not resolve `registry.npmjs.org`, so dependencies could not be installed. As a result, the complete React/Next.js/GSAP semantic TypeScript check, ESLint, Tailwind compilation, Next.js production build and all Playwright tests remain **unverified**. No visual, browser, accessibility, privacy, security or deployment audit was performed.

The Playwright source includes nine interaction scenarios, configured for desktop and mobile Chromium, with the pinned-scrolling scenario desktop-only. Inclusion of those tests is not a claim that they passed.

No package lockfile is bundled: dependency resolution was not completed. Inspect and commit the generated lockfile after the first successful networked install, then use `npm ci` in CI.

## Media handoff

No original photographs were supplied. The application preserves JPEG-primary image slots 1–11, with WebP fallbacks only for slots 3, 4 and 11. It uses a localized archive fallback when a required image cannot load; no unrelated product photograph is substituted.

The release asset check intentionally remains red until approved files are supplied. It verifies presence and basic JPEG/WebP file signatures, not copyright, full image decoding, dimensions or visual suitability.

## Complete the release checks

Use a networked Node.js 22+ environment and copy the approved images into `public/images/` before the release gate:

```bash
npm install
npx playwright install chromium
npm run check:release
```

This runs asset checks, ESLint, the complete TypeScript check, unit tests, the production build, and then Playwright. The browser suite launches the production server on port 3100. `next/font/google` needs build-time access to its font sources. Review both languages, all three currencies, keyboard interaction, mobile layout, reduced motion and normal scrolling in real browsers.

Authentication, payments, tracking and bookings are simulations by design, matching the requested frontend scope. Passing these checks would not turn them into real merchant services; see `RELEASE.md` for those separate release requirements.
