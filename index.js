#!/usr/bin/env node
var exec = require('child_process').exec
var spawn = require('cross-spawn')
var npmRunPath = require('npm-run-path-compat')
var glob = require('glob')
var github = require('github-from-package')
var path = require('path')
var gh = require('ghreleases')
var log = require('npmlog')
var minimist = require('minimist')
var version = require('./package').version

log.heading = 'prebuild-ci'
log.level = 'verbose'

if (!process.env.CI) {
  log.error('This is not CI environment')
  process.exit(0)
}

var token = process.env.GITHUB_TOKEN
if (!token) {
  log.error('GITHUB_TOKEN required')
  process.exit(0)
}

var argv = minimist(process.argv.slice(2))
var buildCommand = argv.command || 'npm run build'
var uploadFrom = argv.from || 'dist'
var uploadFiles = argv.files || '*'

log.info('begin', 'Build-JSLib-CI version', version)

getPackageVersion('HEAD', function (err, head) {
  if (err) throw err

  getPackageVersion('HEAD~1', function (err, prev) {
    if (err) throw err
    if (head === prev) {
      log.info('No version bump, exiting')
      process.exit(0)
    }

    build(function (err, code) {
      if (err) process.exit(code)

      glob(uploadFiles, { cwd: uploadFrom }, function (err, files) {
        if (err) throw err

        files = files.map(function (file) {
          return path.resolve(path.join(uploadFrom, file))
        })

        upload(files, function (err) {
          if (err) throw err
        })
      })
    })
  })
})

function getPackageVersion (rev, cb) {
  exec('git show ' + rev + ':package.json', {
    encoding: 'utf8'
  }, function (err, diff) {
    cb(err, diff && JSON.parse(diff).version)
  })
}

function build (cb) {
  log.info('build', buildCommand)
  var args = buildCommand.split(' ')
  var ps = spawn(args[0], args.slice(1), { env: npmRunPath.env() })
  ps.stdout.pipe(process.stdout)
  ps.stderr.pipe(process.stderr)
  ps.on('exit', function (code) {
    if (code) return cb(Error(), code)
    cb()
  })
}

function upload (files, cb) {
  var pkg = require(path.resolve('./package.json'))

  var url = github(pkg)
  if (!url) return cb(new Error('package.json is missing a repository field'))

  var auth = { user: 'x-oauth', token: token }
  var user = url.split('/')[3]
  var repo = url.split('/')[4]
  var tag = 'v' + pkg.version

  gh.create(auth, user, repo, { tag_name: tag }, function () {
    gh.getByTag(auth, user, repo, tag, function (err, release) {
      if (err) return cb(err)

      var assets = release.assets.map(function (asset) {
        return asset.name
      })

      var filtered = files.filter(function (file) {
        return !assets.some(function (asset) {
          return asset === path.basename(file)
        })
      })

      filtered.forEach(function (file) {
        log.info('upload', file)
      })

      gh.uploadAssets(auth, user, repo, 'tags/' + tag, filtered, cb)
    })
  })
}
