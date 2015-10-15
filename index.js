/**
 * Created by Denis Bondarenko <bond.den@gmail.com> on 29.07.2015.
 */
"use strict";

//todo: implement ESF coding standards
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var fs = require('fs-extra'),
    path = require('path'),
    _stream = require('stream'),
    exec = require('child_process').exec,
    svgoMod = require('svgo');

var PumlRenderer = (function () {
  function PumlRenderer() {
    _classCallCheck(this, PumlRenderer);

    var H = this;

    this.pumlJar = 'bin/plantuml.8031.jar';
    this.jarPth = path.resolve(__dirname + '/' + this.pumlJar);

    this.supportedFormats = {
      "svg": '-tsvg',
      "eps": '-teps',
      "png": ''
    };

    /**
     * private methods
     * @type {Object}
     */
    this._ = {

      "setFmt": function setFmt() {
        var fmt = arguments.length <= 0 || arguments[0] === undefined ? 'svg' : arguments[0];

        var fmtOpt = H.supportedFormats.svg;
        if (H.supportedFormats.hasOwnProperty(fmt)) {
          fmtOpt = H.supportedFormats[fmt];
        }

        return fmtOpt;
      },

      "createQryDir": function createQryDir(inpDir, outDir) {
        var fmt = arguments.length <= 2 || arguments[2] === undefined ? 'svg' : arguments[2];

        return 'java -jar ' + H.jarPth + ' ' + '-charset "utf8" ' + H._.setFmt(fmt) + ' ' + '-o "' + outDir + '" "' + path.resolve(inpDir + '/**.puml') + '"';
      },

      "createQryFile": function createQryFile(inp, out) {
        var fmt = arguments.length <= 2 || arguments[2] === undefined ? 'svg' : arguments[2];

        return 'java -jar ' + H.jarPth + ' ' + '-charset "utf8" ' + H._.setFmt(fmt) + ' ' + '-o "' + out + '" "' + inp + '"';
      },

      "createQryStr": function createQryStr(inpStr, outFile) {
        var fmt = arguments.length <= 2 || arguments[2] === undefined ? 'svg' : arguments[2];

        return 'java -jar ' + H.jarPth + ' ' + '-charset "utf8" ' + H._.setFmt(fmt) + ' ' + '-pipe > "' + outFile + '"';
      },

      "createQryStm": function createQryStm() {
        var fmt = arguments.length <= 0 || arguments[0] === undefined ? 'svg' : arguments[0];

        return 'java -jar ' + H.jarPth + ' ' + '-charset "utf8" ' + H._.setFmt(fmt) + ' ' + '-pipe';
      }

    };
  }

  //todo: clean after render files by *.cmapx existence
  //todo: limit execution times
  /**
   * [renderDir description]
   * @param  {string}  inpDir input directory, that is to be recursively scanned
   * @param  {string}  outDir output directory to save rendered files
   * @return {Promise}        returns a Promise, tha is resolved on process end.
   */

  _createClass(PumlRenderer, [{
    key: 'renderDir',
    value: function renderDir(inpDir, outDir) {
      var H = this;
      return new Promise(function (rs, rj) {

        var t = setInterval(function () {
          process.stdout.write(' ->');
        }, 1000);

        exec(H._.createQryDir(inpDir, outDir), {
          encoding: "utf8"
        }, function (e, r) {
          if (e) {
            clearInterval(t);
            rj(e);
            return e;
          }
          clearInterval(t);
          rs(true);
        });
      });
    }
  }, {
    key: 'cleanSvgFile',
    value: function cleanSvgFile(fileOut) {
      var H = this;
      return new Promise(function (rs, rj) {

        fs.readFile(fileOut, 'utf8', function (e1, r1) {

          if (e1) {
            rj(e1);
            return e1;
          }

          var svgo = new svgoMod({
            plugins: [{
              cleanupIDs: false
            }]
          });
          svgo.optimize(r1, function (r2) {

            if (!r2) {
              var e2 = new Error('SVG Optimisation Error');
              rj(e2);
              return e2;
            }

            fileOut = path.resolve(dirOut + '/' + fileOutBase + '.opt.' + format);

            fs.writeFile(fileOut, r2.data, function (e3, r3) {

              if (e3) {
                rj(e3);
                return e3;
              }

              rs(fileOut);
            });
          });
        });
      });
    }

    /**
     * Renders a single puml to an image of one of supported by PlantUML formats
     * @param  {string} fileIn       path to input file
     * @param  {string} dirOut       output directory
     * @param  {string} format='svg' format of rendered image, supported formats: SVG, PNG, EPS. Default: SVG. Optional
     * @return {Promise}             returns a Promise
     */
  }, {
    key: 'renderFile',
    value: function renderFile(fileIn, dirOut) {
      var format = arguments.length <= 2 || arguments[2] === undefined ? 'svg' : arguments[2];

      var H = this;
      return new Promise(function (rs, rj) {

        exec(H._.createQryFile(fileIn, dirOut, format), {
          encoding: "utf8"
        }, function (e, r) {

          if (e) {
            rj(e);
            return e;
          }

          var fileOutBase = path.basename(fileIn, '.puml');
          var fileOut = path.resolve(dirOut + '/' + fileOutBase + '.' + format);

          if (format === 'svg') {

            H.cleanSvgFile(fileOut).then(function (r) {
              rs(fileOut);
            })['catch'](function (e) {
              rj(e);
              return e;
            });
          } else {
            rs(fileOut);
          }
        });
      });
    }
  }, {
    key: 'renderString',
    value: function renderString(strIn, fileOut) {
      var format = arguments.length <= 2 || arguments[2] === undefined ? 'svg' : arguments[2];

      var H = this;
      return new Promise(function (rs, rj) {

        var qry = H._.createQryStr(strIn, fileOut, format);
        var pcs = exec(qry);

        pcs.stdin.write(strIn, function (e) {
          if (e) {
            rj(e);
          }
          pcs.stdin.end();
        });

        pcs.on('error', function (e) {
          rj(e);
          return e;
        });

        pcs.stderr.on('data', function (data) {
          rj('stderr: ' + data);
          return 1;
        });

        pcs.on('close', function (code) {
          if (code !== 0) {
            rj(new Error(qry + ' exited with code ' + code));
          } else {
            rs(code);
          }
        });
      });
    }

    /**
     * Renders a stream of utf8-encoded puml code to selected format. Currently supported SVG
     * @param  {string} format='svg' format of rendered image, supported formats: SVG. Default: SVG. Optional
     * @return {stream.Duplex}       returns a duplex stream, that can be piped in and out.
     */
  }, {
    key: 'stream',
    value: function stream() {
      var format = arguments.length <= 0 || arguments[0] === undefined ? 'svg' : arguments[0];

      var pcs = exec(this._.createQryStm(format));

      var stm = _stream.Duplex({
        read: function read(n) {
          //console.log('To read: '+n);
        },
        write: function write(d, encoding, next) {

          pcs.stdin.write(d, null, function () {
            pcs.stdin.end();
          });
        }
      });

      pcs.stdout.on('data', function (d) {
        stm.push(d);
      });

      pcs.stdout.on('end', function () {
        stm.push(null);
      });

      pcs.stderr.on('data', function (v) {
        stm.push(null);
      });

      pcs.on('error', function (e) {
        stm.push(null);
      });

      pcs.on('close', function (e) {
        stm.push(null);
      });

      return stm;
    }
  }]);

  return PumlRenderer;
})();

exports.PumlRenderer = PumlRenderer;
//# sourceMappingURL=.maps/index.es7.js.map
