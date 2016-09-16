/**
 * Created by root on 7/29/15.
 */
//todo: create tests for incorrect data abd error handling
'use strict';

var
  assert   =require('chai').assert,
  path     =require('path'),
  fs       =require('fs-extra'),
  exec     =require('child_process').exec,

  Rdr      =require('../index.js').PumlRenderer
  ;

var rdr=null;
var dir={
  "inp":path.resolve(__dirname+'/d/inp'),
  "out":path.resolve(__dirname+'/d/out'),
  "rt" :path.resolve(__dirname+'/d')
};

function replaceVar(s){
  return s.replace(/( id="[^"]+")|(url\(#[^\)]+\)")/g,'');
}

suite('ESF-PUML Suite',function(){

  suite('init',function(){

    test('test Dot',done=>{

      exec('java -jar '+path.resolve(__dirname+'/../bin/plantuml.jar')+' -testdot',(e,r)=>{
        if(e){
          done(e);
          return e;
        }
        done();
      });

    });

    test('It should init the app',done=>{
      rdr=rdr||new Rdr();
      assert.isObject(rdr, 'rdr should be an object');
      done();
    });

  });

  suite('run',function(){
    const tmOut=60000;
    this.timeout(tmOut);

    suiteSetup((done)=>{

      //clean out dir
      fs.emptyDir(dir.out,e=>{
        if(e){
          done(e);
        }else{
          
          let 
            subDirs=[
              'rdr',
              'rs',
              'fpng',
              'spng',
              'ssvg'
            ],
            wtr=[]
            ;
          
          subDirs.forEach(sd=>{
            wtr.push(new Promise((rs1,rj1)=>{
              
              var subDir=path.resolve(dir.out+'/'+sd);              
              fs.ensureDir(subDir,e1=>{
                
                if(e1){
                  rj1(e1);
                  return;
                }
                
                fs.chmod(subDir,0o777,e3=>{

                  if(e3){
                    rj1(e3);
                    return;
                  }

                  rs1();  
                  
                });
                
              });
              
            }));
          });
          
          Promise.all(wtr).then(r2=>{

            rdr=rdr||new Rdr();
            done();
            
          }).catch(e2=>{
            
            done(e2);
            
          });
          
        }
      });

    });

    test('renderDir',done=>{
      
      const outSubDir='/rdr';
      
      rdr.renderDir(dir.inp,dir.out+outSubDir).then(r=>{

        fs.readdir(dir.out+outSubDir,(e,d)=>{

          if(e){
            done(e);
            return e;
          }

          console.log('');

          assert.isArray(d,'d should be an array');
          assert.equal(d.length,3,'there should be 3 files (recursive process dirs)');
          assert.deepEqual(d,['test1.svg','test2.svg','test3.svg'],'files should be *.svg');

          done();

        });

      }).catch((e)=>{
        done(e);
      });

    });

    test('renderFile to png',done=>{

      const outSubDir='/fpng';

      rdr.renderFile(
        path.resolve(dir.inp+'/test1.puml'),
        dir.out+outSubDir,
        'png'
      ).then((r)=>{

        fs.readdir(dir.out+outSubDir,(e,d)=>{

          if(e){
            done(e);
            return e;
          }

          assert.isArray(d,'d should be an array');
          assert.equal(d.length,1,'there should be 1 file rendered');
          assert.deepEqual(d,['test1.png'],'files should be file `test1.png`');

          done();

        });

      }).catch((e)=>{
        done(e);
      });

    });

    test('renderString',done=>{

      const outSubDir='/rs';

      var tstStr=`
      @startuml

      title Test 4

      class TstCls1 {
        +var1
        +mtd1()
      }

      class TstCls2 {
        +var1
        +mtd1()
      }

      TstCls2 -> TstCls1

      footer
        test
      end footer

      @enduml
      `;

      rdr.renderString(
        tstStr,
        path.resolve(dir.out+outSubDir+'/test4.png'),
        'png'
      ).then((r)=>{

        fs.readdir(dir.out+outSubDir,(e,d)=>{

          if(e){
            done(e);
            return e;
          }

          assert.isArray(d,'d should be an array');
          assert.equal(d.length,1,'there should be 1 file rendered');
          assert.deepEqual(d,['test4.png'],'files should be file `test4.png`');

          done();

        });

      }).catch((e)=>{
        done(e);
      });

    });

    test('renderStringToString',done=>{

      //const outSubDir='/rsts';

      var tstStr=`
        @startuml
  
        title Test 4
  
        class TstCls1 {
          +var1
          +mtd1()
        }
  
        class TstCls2 {
          +var1
          +mtd1()
        }
  
        TstCls2 -> TstCls1
  
        footer
          test
        end footer
  
        @enduml
        `,
        etalon=replaceVar('<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" contentScriptType="application/ecmascript" contentStyleType="text/css" height="123px" preserveAspectRatio="none" style="width:204px;height:123px;" version="1.1" viewBox="0 0 204 123" width="204px" zoomAndPan="magnify"><defs><filter height="300%" id="fsczueq" width="300%" x="-1" y="-1"><feGaussianBlur result="blurOut" stdDeviation="2.0"/><feColorMatrix in="blurOut" result="blurOut2" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .4 0"/><feOffset dx="4.0" dy="4.0" in="blurOut2" result="blurOut3"/><feBlend in="SourceGraphic" in2="blurOut3" mode="normal"/></filter></defs><g><text fill="#000000" font-family="sans-serif" font-size="18" lengthAdjust="spacingAndGlyphs" textLength="55" x="79" y="16.708">Test 4</text><!--class TstCls1--><rect fill="#FEFECE" filter="url(#fsczueq)" height="73.6094" style="stroke: #A80036; stroke-width: 1.5;" width="77" x="118" y="28.9531"/><ellipse cx="133" cy="44.9531" fill="#ADD1B2" rx="11" ry="11" style="stroke: #A80036; stroke-width: 1.0;"/><path d="M135.9688,50.5938 Q135.3906,50.8906 134.75,51.0391 Q134.1094,51.1875 133.4063,51.1875 Q130.9063,51.1875 129.5859,49.5391 Q128.2656,47.8906 128.2656,44.7656 Q128.2656,41.6406 129.5859,39.9844 Q130.9063,38.3281 133.4063,38.3281 Q134.1094,38.3281 134.7578,38.4844 Q135.4063,38.6406 135.9688,38.9375 L135.9688,41.6563 Q135.3438,41.0781 134.75,40.8047 Q134.1563,40.5313 133.5313,40.5313 Q132.1875,40.5313 131.5,41.6016 Q130.8125,42.6719 130.8125,44.7656 Q130.8125,46.8594 131.5,47.9297 Q132.1875,49 133.5313,49 Q134.1563,49 134.75,48.7266 Q135.3438,48.4531 135.9688,47.875 L135.9688,50.5938 Z "/><text fill="#000000" font-family="sans-serif" font-size="12" lengthAdjust="spacingAndGlyphs" textLength="45" x="147" y="49.1074">TstCls1</text><line style="stroke: #A80036; stroke-width: 1.5;" x1="119" x2="194" y1="60.9531" y2="60.9531"/><ellipse cx="129" cy="72.8555" fill="none" rx="3" ry="3" style="stroke: #038048; stroke-width: 1.0;"/><text fill="#000000" font-family="sans-serif" font-size="11" lengthAdjust="spacingAndGlyphs" textLength="25" x="138" y="75.1636">var1</text><line style="stroke: #A80036; stroke-width: 1.5;" x1="119" x2="194" y1="81.7578" y2="81.7578"/><ellipse cx="129" cy="93.6602" fill="#84BE84" rx="3" ry="3" style="stroke: #038048; stroke-width: 1.0;"/><text fill="#000000" font-family="sans-serif" font-size="11" lengthAdjust="spacingAndGlyphs" textLength="37" x="138" y="95.9683">mtd1()</text><!--class TstCls2--><rect fill="#FEFECE" filter="url(#fsczueq)" height="73.6094" style="stroke: #A80036; stroke-width: 1.5;" width="77" x="6" y="28.9531"/><ellipse cx="21" cy="44.9531" fill="#ADD1B2" rx="11" ry="11" style="stroke: #A80036; stroke-width: 1.0;"/><path d="M23.9688,50.5938 Q23.3906,50.8906 22.75,51.0391 Q22.1094,51.1875 21.4063,51.1875 Q18.9063,51.1875 17.5859,49.5391 Q16.2656,47.8906 16.2656,44.7656 Q16.2656,41.6406 17.5859,39.9844 Q18.9063,38.3281 21.4063,38.3281 Q22.1094,38.3281 22.7578,38.4844 Q23.4063,38.6406 23.9688,38.9375 L23.9688,41.6563 Q23.3438,41.0781 22.75,40.8047 Q22.1563,40.5313 21.5313,40.5313 Q20.1875,40.5313 19.5,41.6016 Q18.8125,42.6719 18.8125,44.7656 Q18.8125,46.8594 19.5,47.9297 Q20.1875,49 21.5313,49 Q22.1563,49 22.75,48.7266 Q23.3438,48.4531 23.9688,47.875 L23.9688,50.5938 Z "/><text fill="#000000" font-family="sans-serif" font-size="12" lengthAdjust="spacingAndGlyphs" textLength="45" x="35" y="49.1074">TstCls2</text><line style="stroke: #A80036; stroke-width: 1.5;" x1="7" x2="82" y1="60.9531" y2="60.9531"/><ellipse cx="17" cy="72.8555" fill="none" rx="3" ry="3" style="stroke: #038048; stroke-width: 1.0;"/><text fill="#000000" font-family="sans-serif" font-size="11" lengthAdjust="spacingAndGlyphs" textLength="25" x="26" y="75.1636">var1</text><line style="stroke: #A80036; stroke-width: 1.5;" x1="7" x2="82" y1="81.7578" y2="81.7578"/><ellipse cx="17" cy="93.6602" fill="#84BE84" rx="3" ry="3" style="stroke: #038048; stroke-width: 1.0;"/><text fill="#000000" font-family="sans-serif" font-size="11" lengthAdjust="spacingAndGlyphs" textLength="37" x="26" y="95.9683">mtd1()</text><path d="M83.4375,65.9531 C93.24,65.9531 103.0424,65.9531 112.845,65.9531 " fill="none" style="stroke: #A80036; stroke-width: 1.0;"/><polygon fill="#A80036" points="117.971,65.9531,108.971,61.9531,112.971,65.9531,108.971,69.9531,117.971,65.9531" style="stroke: #A80036; stroke-width: 1.0;"/><text fill="#888888" font-family="sans-serif" font-size="10" lengthAdjust="spacingAndGlyphs" textLength="19" x="97" y="122.2354">test</text></g></svg>')
        ;

      rdr.renderStringToString(
        tstStr
      ).then(r=>{

        r=replaceVar(r);
        assert.isString(r,'Result should be a string for the default fmt');
        assert.equal(r,etalon,'svg output should be equal to etalon');
        
        done();

      }).catch(e=>{
        done(e);
      });

    });

    test('stream png',done=>{

      const outSubDir='/spng';

      try{

        var rs=fs.createReadStream ( path.resolve(dir.inp+'/test2.puml'),{encoding:'utf8', autoClose: true} );
        var ws=fs.createWriteStream( path.resolve(dir.out+outSubDir+'/test5.png' ) );
        var ps=rdr.stream('png');

        rs
        .pipe(ps)
        .pipe(ws);

        ws.on('error',(e)=>{
          done(e);
        });

        ws.on('finish',()=>{
          done();
        });

      }catch(e){
        done(e);
      }

    });

    test('stream svg',done=>{

      const
        outSubDir='/ssvg',
        inpFile='test2',
        outFile='test5'
        ;
      
      var etalon='etalon';
      fs.readFile(path.resolve(dir.rt+'/'+outFile+'.etalon.svg'),{encoding:"utf8"},(e,r)=>{

        if(e){
          done(e);
          return e;
        }

        etalon=replaceVar(r);

        try{

          var rs=fs.createReadStream ( path.resolve(dir.inp+'/'+inpFile+'.puml'),{encoding:'utf8', autoClose: true} );
          var ws=fs.createWriteStream( path.resolve(dir.out+outSubDir+'/'+outFile+'.svg' ) );
          var ps=rdr.stream('svg');

          rs
            .pipe(ps)
            .pipe(ws);

          ws.on('error',e=>{
            done(e);
          });

          ws.on('finish',()=>{

            fs.readFile(
              path.resolve(dir.out+outSubDir+'/'+outFile+'.svg'),
              {encoding:"utf8"},
              (e1,r1)=>{
  
                if(e1){
                  done(e1);
                  return e1;
                }
                
                //console.log(r1);
                
                r1=replaceVar(r1);
  
                assert.equal(r1,etalon,'checking content generated properly');
  
                done();
  
              }
            );

          });

        }catch(e){
          done(e);
        }

      });

    });

    test('relative include path with custom cwd set',done=>{

      var
        etalon ='etalon',
        inpFile=path.resolve(dir.rt+'/inp_rel/sub/test6.puml'),
        outFile=path.resolve(dir.out+'/test6.svg')
        ;

      try{

        var rs=fs.createReadStream ( inpFile,{encoding:'utf8', autoClose: true} );
        var ws=fs.createWriteStream(outFile);
        var ps=rdr.stream('svg',path.dirname(inpFile));

        rs
          .pipe(ps)
          .pipe(ws);

        ws.on('error',e=>{
          done(e);
        });

        ws.on('finish',()=>{

          fs.readFile(outFile,{encoding:"utf8"},(e1,r1)=>{

            if(e1){
              done(e1);
              return e1;
            }

            //assert.equal(r1,etalon,'checking content generated properly');

            done();

          });

        });

      }catch(e){
        done(e);
      }

    });

  });

});
