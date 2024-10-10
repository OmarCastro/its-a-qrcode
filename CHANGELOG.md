# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - Unreleased


## [0.5.0] - 2024-10-10

### Added

- `--qrcode-color` CSS property support
- set error correction level via JS API
- improve README
- add another compression stage for utf8 to JIS table, reducing the table by 17% compared to previous stage (final minified + gzipped package reduced by 1kB)

### Changed

- refactored Error correction table to reduce file size


## [0.4.0] - 2024-02-07

### Added

- corner color support
- `--qrcode-color` CSS property support
- `--qrcode-corner-border-color` CSS property support
- `--qrcode-corner-center-color` CSS property support
- add style for body, corner border and center
- `--qrcode-style` support CSS property support
- `--qrcode-dot-style` CSS property support
- `--qrcode-corner-border-style` CSS property support
- `--qrcode-corner-center-style` CSS property support

## [0.3.0] - 2024-01-15

### Added

- BREAKING CHANGE: whitespace processing on qr-code element textContent before transforming to QR Code image. To maintain backward compatibility add the following attribute: `data-whitespace="pre"`
- add another compression stage for utf8 to JIS table, reducing the table by 30% compared to previous stage (final minified + gzipped package reduced by 3kB)
- add vCard whitespace processor
- add vEvent whitespace processor
- improve documentation for mobile use

## [0.2.0] - 2023-12-29

### Added

- scalable qr code image
- improved documenatation
- UI tests
- smoke tests

### Fixed

- Fix inverted bits between High and Quartile error levels
- Fix wrong README on npm
- Fix wrong import path

## [0.1.0] - 2023-12-23

### Added

- First release, the component is usable. Needs more testing and documentation


