const RELEASES_API = "https://api.github.com/repos/blotterchains/aftab-releases/releases/latest";
const RELEASES_PAGE = "https://github.com/blotterchains/aftab-releases/releases/latest";

const releasePill = document.querySelector("#release-pill");
const heroVersion = document.querySelector("#hero-version");
const downloadVersion = document.querySelector("#download-version");
const windowsReleaseLink = document.querySelector("#windows-release-link");
const windowsPackageList = document.querySelector("#windows-packages");
const windowsReleaseMeta = document.querySelector("#windows-release-meta");
const releaseLink = document.querySelector("#release-link");
const linuxPackageList = document.querySelector("#linux-packages");
const linuxReleaseMeta = document.querySelector("#release-meta");
const androidReleaseLink = document.querySelector("#android-release-link");
const androidAvailability = document.querySelector("#android-availability");
const androidPackageList = document.querySelector("#android-packages");
const androidDownloadLink = document.querySelector("#android-download-link");
const androidReleaseMeta = document.querySelector("#android-release-meta");

function formatReleaseDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function setReleaseLinks(url) {
  releasePill.href = url;
  windowsReleaseLink.href = url;
  releaseLink.href = url;
  androidReleaseLink.href = url;
  androidDownloadLink.href = url;
}

function addPackageLink(container, { name, url, detail, extension, className = "" }) {
  const link = document.createElement("a");
  link.className = "package-link";
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";

  const badge = document.createElement("span");
  badge.className = `package-ext ${className}`.trim();
  badge.textContent = extension;
  const copy = document.createElement("span");
  const title = document.createElement("b");
  title.textContent = name;
  const subtitle = document.createElement("small");
  subtitle.textContent = detail;
  copy.append(title, subtitle);
  const arrow = document.createElement("span");
  arrow.className = "package-arrow";
  arrow.textContent = "↓";
  link.append(badge, copy, arrow);
  container.append(link);
}

function addAndroidPackage({ name, url }) {
  const link = document.createElement("a");
  link.className = "android-package-link";
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  const architecture = name.match(/(?:arm64|aarch64|x86_64|x86|arm)/i)?.[0] ?? "APK";
  const filename = document.createElement("span");
  filename.textContent = `Android · ${architecture}`;
  const badge = document.createElement("b");
  badge.textContent = "Download ↓";
  link.append(filename, badge);
  androidPackageList.append(link);
}

function setReleaseMeta(element, version, date, isError = false) {
  const suffix = isError ? "Release details unavailable" : `Released ${date || "recently"}`;
  element.replaceChildren();
  const label = document.createTextNode(`Latest release ${version} · ${suffix}`);
  element.append(label);
  if (isError) element.classList.add("release-error");
  else element.classList.remove("release-error");
}

function updateDesktopPackages(container, assets, installers, emptyMessage) {
  container.replaceChildren();
  let count = 0;
  for (const installer of installers) {
    const asset = assets.find((item) => installer.test.test(item.name));
    if (!asset || !asset.browser_download_url.startsWith("https://github.com/")) continue;
    addPackageLink(container, {
      name: installer.label,
      url: asset.browser_download_url,
      detail: installer.detail,
      extension: installer.extension,
      className: installer.className,
    });
    count += 1;
  }

  if (!count) {
    const empty = document.createElement("p");
    empty.className = "release-meta";
    empty.textContent = emptyMessage;
    container.append(empty);
  }
}

function updateWindowsPackages(assets) {
  const installers = [
    { extension: ".exe", label: "Windows Setup", detail: "64-bit installer (NSIS)", test: /\.exe$/i },
    { extension: "msi", label: "Windows Installer", detail: "64-bit MSI package", test: /\.msi$/i },
  ];
  updateDesktopPackages(
    windowsPackageList,
    assets,
    installers,
    "No Windows installers are attached to the latest release yet."
  );
}

function updateLinuxPackages(assets) {
  const installers = [
    { extension: ".deb", label: "Debian / Ubuntu", detail: "64-bit installer", test: /\.deb$/i },
    { extension: "App", label: "AppImage", detail: "Portable · 64-bit", className: "appimage-ext", test: /\.appimage$/i },
    { extension: "rpm", label: "Fedora / openSUSE", detail: "64-bit installer", className: "rpm-ext", test: /\.rpm$/i },
  ];
  updateDesktopPackages(
    linuxPackageList,
    assets,
    installers,
    "No Linux installers are attached to the latest release yet."
  );
}

function updateAndroidPackages(assets) {
  const packages = assets
    .filter((asset) => /\.apk$/i.test(asset.name) && asset.browser_download_url.startsWith("https://github.com/"))
    .sort((left, right) => left.name.localeCompare(right.name));

  androidPackageList.replaceChildren();
  androidAvailability.hidden = packages.length > 0;
  androidDownloadLink.hidden = packages.length > 0;

  if (packages.length) {
    packages.forEach(addAndroidPackage);
    androidReleaseMeta.textContent = `${packages.length} Android APK${packages.length === 1 ? "" : "s"} in this release.`;
    return;
  }

  androidAvailability.querySelector("b").textContent = `No Android APK in this release`;
  androidAvailability.querySelector("small").textContent = "There isn't an Android build attached to the latest GitHub release yet. Check back when one is published.";
  androidDownloadLink.textContent = "See the latest release";
  const arrow = document.createElement("span");
  arrow.textContent = "↗";
  androidDownloadLink.append(arrow);
  androidReleaseMeta.textContent = "Android downloads will appear here when an APK is published.";
}

async function loadLatestRelease() {
  try {
    const response = await fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const release = await response.json();
    if (!release.tag_name || !Array.isArray(release.assets) || !release.html_url?.startsWith("https://github.com/")) {
      throw new Error("The release response is incomplete");
    }

    const formattedDate = formatReleaseDate(release.published_at);
    heroVersion.textContent = release.tag_name;
    downloadVersion.textContent = release.tag_name;
    setReleaseLinks(release.html_url);
    updateWindowsPackages(release.assets);
    updateLinuxPackages(release.assets);
    updateAndroidPackages(release.assets);
    setReleaseMeta(windowsReleaseMeta, release.tag_name, formattedDate);
    setReleaseMeta(linuxReleaseMeta, release.tag_name, formattedDate);
  } catch {
    setReleaseLinks(RELEASES_PAGE);
    windowsPackageList.querySelectorAll("a").forEach((link) => { link.href = RELEASES_PAGE; });
    linuxPackageList.querySelectorAll("a").forEach((link) => { link.href = RELEASES_PAGE; });
    setReleaseMeta(windowsReleaseMeta, "Latest", "", true);
    setReleaseMeta(linuxReleaseMeta, "Latest", "", true);
    androidAvailability.querySelector("small").textContent = "The release feed could not be reached. Open GitHub to check for Android builds.";
    androidReleaseMeta.textContent = "Live release details couldn't be loaded.";
  }
}

function selectPlatform(platform) {
  for (const button of document.querySelectorAll(".platform-option")) {
    const selected = button.dataset.platform === platform;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  }
  document.querySelector("#windows-download-panel").hidden = platform !== "windows";
  document.querySelector("#linux-download-panel").hidden = platform !== "linux";
  document.querySelector("#android-download-panel").hidden = platform !== "android";
}

for (const button of document.querySelectorAll(".platform-option")) {
  button.addEventListener("click", () => selectPlatform(button.dataset.platform));
}

const previewTabs = [...document.querySelectorAll(".showcase-tab")];
for (const tab of previewTabs) {
  tab.addEventListener("click", () => {
    for (const current of previewTabs) {
      const active = current === tab;
      current.classList.toggle("is-active", active);
      current.setAttribute("aria-selected", String(active));
      document.querySelector(`#panel-${current.dataset.view}`).hidden = !active;
    }
  });
}

const platform = `${navigator.userAgent} ${navigator.userAgentData?.platform ?? navigator.platform ?? ""}`.toLowerCase();
const detectedPlatform = platform.includes("android") ? "android" : platform.includes("win") ? "windows" : "linux";
selectPlatform(detectedPlatform);
loadLatestRelease();