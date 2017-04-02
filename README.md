# prebuild-ci

[![NPM Package](https://img.shields.io/npm/v/build-jslib-ci.svg?style=flat-square)](https://www.npmjs.org/package/build-jslib-ci) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)

Use CI like [travis][1] and [appveyor][2] for build and upload libraries bundles..

## Motivation

I often see `dist` folder in repositories with builded JS library. Of course it helpful for people because they can download builded library without building on their machine, but this feature adds support complexity. I opened [prebuild-ci][3] for myself and think that is a great idea! So I decide made same for `dist` folders.

## Usage

Add `build-jslib-ci` to your `"test"` script or CI configuration, like this:

```json
  "scripts": {
    "test": "tape test/**/*.js && build-jslib-ci"  
  }
```

Also configure your CI environments to set the environment variable `GITHUB_TOKEN` to your [upload token][4].

Then, whenever a CI job passes _and_ updates `"version"` in the module's `package.json`, the bundles for the current release will be uploaded to GitHub.

## Creditianals

Thank you [Julian Gruber][5] for [prebuild-ci][3]

## License

MIT

[1]: https://travis-ci.org/
[2]: https://www.appveyor.com/
[3]: https://github.com/prebuild/prebuild-ci
[4]: https://github.com/mafintosh/prebuild#create-github-token
[5]: https://github.com/juliangruber
