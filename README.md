# Aftab landing page

A lightweight, single-page product site for Aftab Panel. It is plain HTML, CSS, and JavaScript, with no build step or runtime dependencies, and can be deployed directly to Cloudflare Pages.

## Run locally

From the repository root, start any static file server. For example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy to Cloudflare Pages

Create a Pages project connected to this repository and use:

- **Framework preset:** None
- **Build command:** leave blank
- **Build output directory:** `.`

The `_headers` file sets basic security and static-asset caching headers. The site fetches the latest public GitHub release from `blotterchains/aftab-releases` in the visitor's browser, so Linux package links and any future Android APKs stay current without rebuilding the site.

## Downloads and Android availability

The latest release is checked live for `.deb`, AppImage, `.rpm`, and `.apk` assets. Release downloads are linked directly to GitHub. As of v1.1.0, the release has Linux and Windows installers but **does not include an Android APK**; the Android panel states this clearly and links to the latest release instead of presenting a broken download.

The product previews are original English-language HTML/CSS illustrations of the app interface. They avoid embedding the Persian-language store screenshots, while showing the desktop workspace, SQL console, and Android experience in English.
