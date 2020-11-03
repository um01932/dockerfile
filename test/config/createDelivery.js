// require modules
var fs = require('fs');
var copyfiles = require('copyfiles');
var path = require('path');
var archiver = require('archiver');
var pckg = require('../package.json');
var rimraf = require('rimraf');

copyfiles([
   'README.md',
   'Dockerfile',
   'config/httpd.conf',
   'sample/**/*',
   'lib/**/*',
   'doc/**/*',
   'delivery/temp/mwp-api'], {all: true}, function() {
        var output = fs.createWriteStream('delivery/' + '/workplace-api-v.' + pckg.version + '.zip');
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            rimraf('delivery/temp/', function() {

            });

        });
        archive.on('error', function(err) {
            console.error(err);
        });
        archive.pipe(output);
        archive.directory('delivery/temp/', '/');
        archive.finalize();
    });