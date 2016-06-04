# PlantUML Renderer
[![Code Climate](https://codeclimate.com/github/bondden/esf-puml/badges/gpa.svg)](https://codeclimate.com/github/bondden/esf-puml)

A Node.Js module for converting [PlantUML](http://plantuml.com) files to graphics formats: SVG, PNG, EPS.

## System Requirements
1. [Graphviz](http://www.graphviz.org/) installed.
2. Path to Grapviz Dot executable directory registered in system PATH.

## Installation

```bash
npm i esf-puml
```

## Running unit tests locally
Ensure `tst/d/out` is writable, or redefine it in `tst/index.js`.` Then run:

```bash
esf-puml> npm i -D
esf-puml> gulp test
```

## PlantUML Credits
The module includes the MIT licensed version, available from [MIT licensed PlantUML download](http://plantuml.com/download.html#mit).

## Road map

Version | Functionality                                                   | Status
------- | --------------------------------------------------------------- | --------
0.1.0   | Recursive directory rendering (req. [esf-puml-2](esf-puml-2))   | released
0.2.0   | Single file rendering (req. [esf-puml-4](esf-puml-4))           | released
0.3.0   | String input rendering (req. [esf-puml-2](esf-puml-2))          | released
0.4.0   | Stream rendering to svg (partial req. [esf-puml-5](esf-puml-5)) | released
0.5.0   | String to string (req. [esf-puml-7](esf-puml-7))                | released
1.0.0   | API v.1.0 implementation (req. [esf-puml-6](esf-puml-6))        |
1.1.0   | API v.1.1 implementation (req. [esf-puml-8](esf-puml-8))        | -

## Requirements
### esf-puml-1

ReqId        | Requirement                                                                                             | Implementation Methods
------------ | ------------------------------------------------------------------------------------------------------- | ----------------------
esf-puml-1   | There should be an option to chose a result format: <ul><li>`png`</li><li>`svg`</li><li>`eps`</li></ul> |
esf-puml-2   | Rendering PUML-files from a directory recursively                                                       | `renderDir`
esf-puml-2.1 | It should gather puml-files from nested directories recursively and create the same temporary structure |
esf-puml-2.2 | It should render all the files                                                                          |
esf-puml-2.3 | It should delete puml-sources                                                                           |
esf-puml-2.4 | It should move the result to the `out` directory                                                        |
esf-puml-3   | Rendering a string input                                                                                | `renderString`
esf-puml-3.1 | It should accept puml-string as input                                                                   |
esf-puml-3.2 | It should save an output file at a specified path                                                       |
esf-puml-4   | Rendering a single file                                                                                 | `renderFile`
esf-puml-4.1 | It should gather puml-files from nested directories recursively at `inp` as a root                      |
esf-puml-4.2 | It should write the result in chosen format to Writable stream                                          |
esf-puml-5   | Process a stream                                                                                        | `stream`
esf-puml-5.1 | It should read a stream                                                                                 |
esf-puml-5.2 | It should return a Readable stream                                                                      |
esf-puml-6   | It should implement API v.1.0                                                                           | 
esf-puml-7   | Rendering a string input to string output                                                               | `renderStringToString`
esf-puml-7.1 | It should accept puml-string as input                                                                   |
esf-puml-7.2 | It should return an svg image                                                                           |
esf-puml-8   | It should automatically detect source and provide an according method, API 1.1 imlementation            | `render`

## API
### v.1.1

```javascript
Promise         render                ([string inpDir|inpFile], string outDir=null  [,format='svg'])  //
Promise         renderDir             (string inpDir,           string outDir,      [,format='svg'])  //
Promise         renderFile            (string inpFilePath,      string outDir       [,format='svg'])  //
Promise         renderString          (string pumlString,       string outFilePath  [,format='svg'])  //
Promise         renderStringToString  (string pumlString,       [,string format='svg'])               //
stream.Duplex   stream                ([format='svg']           [,string cwd=null])                   // custom Cwd
```

### v.1.0

```javascript
Promise         renderDir             (string inpDir,       string outDir,      [,format='svg'])  //
Promise         renderFile            (string inpFilePath,  string outDir       [,format='svg'])  //
Promise         renderString          (string pumlString,   string outFilePath  [,format='svg'])  //
Promise         renderStringToString  (string pumlString,   [,format='svg'])                      //
stream.Duplex   stream                ([,format='svg']      [,cwd=null])                          // custom Cwd
```

--------------------------------------------------------------------------------

MIT © [bondden](https://github.com/bondden) 2015
