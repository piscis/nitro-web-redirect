# Changelog

## [2.1.0](https://github.com/piscis/nitro-web-redirect/compare/v2.0.1...v2.1.0) (2026-10-23)

### Features

* publish multi-arch Docker images for amd64 and arm64 (#64) ([43af47a](https://github.com/piscis/nitro-web-redirect/commit/43af47a92cbc11e1cbb1b71461ec868c7cc2bd02))

### Bug Fixes

* start the image with node instead of pnpm via corepack (#66) ([339ecde](https://github.com/piscis/nitro-web-redirect/commit/339ecded898a97c5580b0d7f16b5ed6e443e70ed))

## [2.0.1](https://github.com/piscis/nitro-web-redirect/compare/v2.0.0...v2.0.1) (2026-10-23)

### Bug Fixes

* **deps:** the Docker image runs on Node.js 24.22 (`node:24.22.0-alpine`), along with non-major updates of the build tooling (#57) ([195e59a](https://github.com/piscis/nitro-web-redirect/commit/195e59a5492d45a7cc28f4378d778f37bf1a9c0a))

## [2.0.0](https://github.com/piscis/nitro-web-redirect/compare/v1.9.0...v2.0.0) (2026-10-14)

### ⚠ BREAKING CHANGES

* an invalid configuration now stops the server at
  startup instead of being handled per request. A missing or empty
  REDIRECT_TARGET (or the strings "undefined" / "null"), which used to
  answer every request with 400, now exits with code 1. REDIRECT_STATUS_CODE
  must be one of 301, 302, 303, 307 or 308 (default 301); any other
  value, such as 200, 404 or abc, now exits with code 1.

### Features

* **ai:** Add claude settings and mcp server ([5bf92d7](https://github.com/piscis/nitro-web-redirect/commit/5bf92d76e470b03893cf2f5067385c080bbbe457))
* validate config at startup and make the redirect testable on Nitro v3 (#48) ([7adb016](https://github.com/piscis/nitro-web-redirect/commit/7adb016c3f1df781cd5500cf48746441b7293ee5))

### Bug Fixes

* **deps:** sync lockfile with package.json (#33) ([b1a6cb9](https://github.com/piscis/nitro-web-redirect/commit/b1a6cb95b10f426abd8056752c3c8a2048e8abfb))
* a redirect target counts as having a protocol only on `^https?://`, so a host such as `httpbin.org` is no longer taken for one ([7adb016](https://github.com/piscis/nitro-web-redirect/commit/7adb016c3f1df781cd5500cf48746441b7293ee5))
* trailing slashes on the redirect target are trimmed ([7adb016](https://github.com/piscis/nitro-web-redirect/commit/7adb016c3f1df781cd5500cf48746441b7293ee5))

## [1.9.0](https://github.com/piscis/nitro-web-redirect/compare/v1.8.0...v1.9.0) (2026-03-22)

### Bug Fixes

* skip GitHub-specific workflows on non-GitHub servers (#12) ([c6a50f1](https://github.com/piscis/nitro-web-redirect/commit/c6a50f1621f2d16b6544ec9a8522931996514f52))

## [1.8.0](https://github.com/piscis/nitro-web-redirect/compare/v1.7.0...v1.8.0) (2026-03-22)

### Features

* convert eslint config to typescript ([f6446f0](https://github.com/piscis/nitro-web-redirect/commit/f6446f0e4edab74cc1d170f39f43594cdfd84d09))
* raise min compatiblity ([ebe0c53](https://github.com/piscis/nitro-web-redirect/commit/ebe0c539c13a650a2c72638f75d11fba1f50c2ef))

### Bug Fixes

* removes unnessesary install step ([aa62bbb](https://github.com/piscis/nitro-web-redirect/commit/aa62bbbae9dfc69efd3fdaae2fd8bbf7104b674c))

## [1.7.0](https://github.com/piscis/nitro-web-redirect/compare/v1.6.0...v1.7.0) (2025-06-07)

## [1.6.0](https://github.com/piscis/nitro-web-redirect/compare/v1.5.0...v1.6.0) (2025-06-07)

### Features

* add clean script ([f3d6562](https://github.com/piscis/nitro-web-redirect/commit/f3d65621777f7fb1ddb06e1c44a3acfef9fae46c))
* log request info ([d1666fa](https://github.com/piscis/nitro-web-redirect/commit/d1666fa10685fd7df060c672f3f6990b4a1567a3))

## [1.5.0](https://github.com/piscis/nitro-web-redirect/compare/v1.4.0...v1.5.0) (2025-06-07)

### Features

* extend release build to run tests one more time ([f3820ac](https://github.com/piscis/nitro-web-redirect/commit/f3820ac0a3839395c96634485260426ad68ebf44))

## [1.4.0](https://github.com/piscis/nitro-web-redirect/compare/v1.3.0...v1.4.0) (2025-06-07)

### Features

* adjust renovate config ([64d8801](https://github.com/piscis/nitro-web-redirect/commit/64d88013b1a9f59fb5d4ac2ec741931b957521ba))
* migrate test suite to nitro-test-utils ([9e823f4](https://github.com/piscis/nitro-web-redirect/commit/9e823f494f6ba6e5833da1c12eac97f5886747dd))
* update dokumentation ([fb7f219](https://github.com/piscis/nitro-web-redirect/commit/fb7f219156c7d7d554ad57f5f923d95d35a1a5be))
* upgrade setup action for node / pnpm ([d539d0b](https://github.com/piscis/nitro-web-redirect/commit/d539d0b549096302fd17ddcaec5d51f9f539b214))

### Bug Fixes

* **deps:** Upgrade package dependencies to their latest versions ([6606441](https://github.com/piscis/nitro-web-redirect/commit/66064417a94d939ae32b4e2da8661eeb0866b4be))
* fix format ([43e87d8](https://github.com/piscis/nitro-web-redirect/commit/43e87d870e31a269b95bd79bcdda90a977ced94d))

## [1.3.0](https://github.com/piscis/nitro-web-redirect/compare/v1.2.1...v1.3.0) (2024-06-02)


### Features

* add curl and wget to image ([366a3c3](https://github.com/piscis/nitro-web-redirect/commit/366a3c33907c3920e7937a4306528e3baad463a7))
* use middleware instead of router to redirect routes ([938fb80](https://github.com/piscis/nitro-web-redirect/commit/938fb803c816634b4717fd43f94cbec51c2da776))

## [1.2.1](https://github.com/piscis/nitro-web-redirect/compare/v1.2.0...v1.2.1) (2024-02-01)

## [1.2.0](https://github.com/piscis/nitro-web-redirect/compare/v1.1.2...v1.2.0) (2024-02-01)


### Features

* Add unit-tests (#1) ([a401f4f](https://github.com/piscis/nitro-web-redirect/commit/a401f4f904a98b527c0faafdd96fc2839d6899d0))
* reformat readme.md ([aa2b74c](https://github.com/piscis/nitro-web-redirect/commit/aa2b74cb7b65ee3a706d37fd2d0d0eb946bd72a8))

## [1.1.2](https://github.com/piscis/nitro-web-redirect/compare/v1.1.1...v1.1.2) (2024-02-01)


### Bug Fixes

* fixes a typo in README.md ([cb85252](https://github.com/piscis/nitro-web-redirect/commit/cb85252a807ac1f1ba9580f4fb0db51fa3e11c7f))

## [1.1.1](https://github.com/piscis/nitro-web-redirect/compare/v1.1.0...v1.1.1) (2024-02-01)


### Features

* extend documentation ([9eb9346](https://github.com/piscis/nitro-web-redirect/commit/9eb9346e10ee5e8eb2721f7b11e65366beb2e572))

## [1.1.0](https://github.com/piscis/nitro-web-redirect/compare/v1.0.3...v1.1.0) (2024-02-01)


### Features

* add fallback for missing protocol config ([7058955](https://github.com/piscis/nitro-web-redirect/commit/7058955763980ac539948a89a094f37438a3ade5))

## [1.0.3](https://github.com/piscis/nitro-web-redirect/compare/v1.0.2...v1.0.3) (2024-02-01)

## [1.0.2](https://github.com/piscis/nitro-web-redirect/compare/v1.0.1...v1.0.2) (2024-02-01)


### Features

* add tags hock to docker build ([8017846](https://github.com/piscis/nitro-web-redirect/commit/8017846969e18ac32ddff25f0895713d21ccd8f1))

## [1.0.1](https://github.com/piscis/nitro-web-redirect/compare/1.0.0...v1.0.1) (2024-02-01)

## [1.0.0](https://github.com/piscis/nitro-web-redirect/compare/d9656e8afab88c3bf6282a258251836f3215a854...1.0.0) (2024-02-01)


### Features

* add docker build file ([275cba0](https://github.com/piscis/nitro-web-redirect/commit/275cba0348130c0e59b1948bd31752590b63a843))
* add docker publish image build step ([d7d7062](https://github.com/piscis/nitro-web-redirect/commit/d7d7062858579f070590d7d58ca5398c5a74b9e5))
* add docu for docker build image ([62e8eae](https://github.com/piscis/nitro-web-redirect/commit/62e8eae54c0999c97e780ff90ed73405c8492bc1))
* add dummy teststep ([0fc7e48](https://github.com/piscis/nitro-web-redirect/commit/0fc7e48af8851d4ef634d80968055df78ce886bf))
* add github build actions ([9604430](https://github.com/piscis/nitro-web-redirect/commit/9604430bcab44578a1cd31ce3964574a313c17ed))
* adds basic release config ([b81e747](https://github.com/piscis/nitro-web-redirect/commit/b81e74712cda3734c30185209712c3fa00d0dfd8))
* adds editorconfig ([335506b](https://github.com/piscis/nitro-web-redirect/commit/335506bfe9b24ceb3c2f0ee1c75bd2e384d71fa3))
* adds eslint configuration ([8d2a50d](https://github.com/piscis/nitro-web-redirect/commit/8d2a50d19b3c80e1e146d703148a70ce4f168d1e))
* adds example for enviroment config ([ffad44b](https://github.com/piscis/nitro-web-redirect/commit/ffad44bb0fe46b7af1c21e77656a96947ade03f5))
* adds gitignore config ([d9656e8](https://github.com/piscis/nitro-web-redirect/commit/d9656e8afab88c3bf6282a258251836f3215a854))
* adds nitro configuration ([0249f95](https://github.com/piscis/nitro-web-redirect/commit/0249f951cb38727387eb3020f4bb8354963b9eca))
* adds pnpm package configuration ([dd659ff](https://github.com/piscis/nitro-web-redirect/commit/dd659ff5d4594ab9fbded2b0af31a9d76dd5a03b))
* adds redirect routing ([4943231](https://github.com/piscis/nitro-web-redirect/commit/4943231016758d11ac7f70e588e1ef7c296c9717))
* adds release-it config ([20375dc](https://github.com/piscis/nitro-web-redirect/commit/20375dc98e60e03d9b73b80d3b71d4de8ea1a920))
* adds renovate config ([efe9a50](https://github.com/piscis/nitro-web-redirect/commit/efe9a5060298ffc79184c1fc3088037c140ae603))
* eslint ignore .env and .nitro directories ([051d610](https://github.com/piscis/nitro-web-redirect/commit/051d6104b4d5ff24d8daf30f2ded51d0d420c00f))
* extend docker build and push step ([095585f](https://github.com/piscis/nitro-web-redirect/commit/095585fc21be803a02210c5d42f66b8594ee2178))
* extend docker ignore file with build and github actions ([e59f99f](https://github.com/piscis/nitro-web-redirect/commit/e59f99f4c878a9d0d33200863d3b1ad0e1b90511))
* license MIT ([638e20e](https://github.com/piscis/nitro-web-redirect/commit/638e20ec16bf1556003c894bed7bc67d79c5f66d))
* setup pnpm config ([2228fdc](https://github.com/piscis/nitro-web-redirect/commit/2228fdc2ddacd55e2ce82b2b585f05b98636bb62))
* use actions for node setup ([768f77e](https://github.com/piscis/nitro-web-redirect/commit/768f77eb6c08386b70a0cb1a2da74fd212c08d8b))


### Bug Fixes

* fix pnpm build step ([c87606e](https://github.com/piscis/nitro-web-redirect/commit/c87606ecaad498c1fe334516063270243295f60b))
* formating issues ([d317f09](https://github.com/piscis/nitro-web-redirect/commit/d317f096effdb2f836404531ec115d8186c1a164))

## 1.0.0 (2024-02-01)


### Features

* add docker build file ([275cba0](https://github.com/piscis/nitro-web-redirect/commit/275cba0348130c0e59b1948bd31752590b63a843))
* add docker publish image build step ([d7d7062](https://github.com/piscis/nitro-web-redirect/commit/d7d7062858579f070590d7d58ca5398c5a74b9e5))
* add docu for docker build image ([62e8eae](https://github.com/piscis/nitro-web-redirect/commit/62e8eae54c0999c97e780ff90ed73405c8492bc1))
* add dummy teststep ([0fc7e48](https://github.com/piscis/nitro-web-redirect/commit/0fc7e48af8851d4ef634d80968055df78ce886bf))
* add github build actions ([9604430](https://github.com/piscis/nitro-web-redirect/commit/9604430bcab44578a1cd31ce3964574a313c17ed))
* adds basic release config ([b81e747](https://github.com/piscis/nitro-web-redirect/commit/b81e74712cda3734c30185209712c3fa00d0dfd8))
* adds editorconfig ([335506b](https://github.com/piscis/nitro-web-redirect/commit/335506bfe9b24ceb3c2f0ee1c75bd2e384d71fa3))
* adds eslint configuration ([8d2a50d](https://github.com/piscis/nitro-web-redirect/commit/8d2a50d19b3c80e1e146d703148a70ce4f168d1e))
* adds example for enviroment config ([ffad44b](https://github.com/piscis/nitro-web-redirect/commit/ffad44bb0fe46b7af1c21e77656a96947ade03f5))
* adds gitignore config ([d9656e8](https://github.com/piscis/nitro-web-redirect/commit/d9656e8afab88c3bf6282a258251836f3215a854))
* adds nitro configuration ([0249f95](https://github.com/piscis/nitro-web-redirect/commit/0249f951cb38727387eb3020f4bb8354963b9eca))
* adds pnpm package configuration ([dd659ff](https://github.com/piscis/nitro-web-redirect/commit/dd659ff5d4594ab9fbded2b0af31a9d76dd5a03b))
* adds redirect routing ([4943231](https://github.com/piscis/nitro-web-redirect/commit/4943231016758d11ac7f70e588e1ef7c296c9717))
* adds release-it config ([20375dc](https://github.com/piscis/nitro-web-redirect/commit/20375dc98e60e03d9b73b80d3b71d4de8ea1a920))
* adds renovate config ([efe9a50](https://github.com/piscis/nitro-web-redirect/commit/efe9a5060298ffc79184c1fc3088037c140ae603))
* eslint ignore .env and .nitro directories ([051d610](https://github.com/piscis/nitro-web-redirect/commit/051d6104b4d5ff24d8daf30f2ded51d0d420c00f))
* extend docker build and push step ([095585f](https://github.com/piscis/nitro-web-redirect/commit/095585fc21be803a02210c5d42f66b8594ee2178))
* extend docker ignore file with build and github actions ([e59f99f](https://github.com/piscis/nitro-web-redirect/commit/e59f99f4c878a9d0d33200863d3b1ad0e1b90511))
* license MIT ([638e20e](https://github.com/piscis/nitro-web-redirect/commit/638e20ec16bf1556003c894bed7bc67d79c5f66d))
* setup pnpm config ([2228fdc](https://github.com/piscis/nitro-web-redirect/commit/2228fdc2ddacd55e2ce82b2b585f05b98636bb62))
* use actions for node setup ([768f77e](https://github.com/piscis/nitro-web-redirect/commit/768f77eb6c08386b70a0cb1a2da74fd212c08d8b))


### Bug Fixes

* fix pnpm build step ([c87606e](https://github.com/piscis/nitro-web-redirect/commit/c87606ecaad498c1fe334516063270243295f60b))
* formating issues ([d317f09](https://github.com/piscis/nitro-web-redirect/commit/d317f096effdb2f836404531ec115d8186c1a164))
