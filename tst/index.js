/**
 * Created by root on 7/29/15.
 */
//todo: create tests for incorrect data abd error handling
'use strict';

require('babel/polyfill');

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

suite('ESF-PUML Suite',function(){

  suite('init',function(){

    test.skip('test Dot',(done)=>{

      exec('java -jar '+path.resolve(__dirname+'/../bin/plantuml.8031.jar')+' -testdot',(e,r)=>{
        if(e){
          done(e);
          return e;
        }
        done();
      });

    });

    test.skip('It should init the app',(done)=>{
      rdr=rdr||new Rdr();
      assert.isObject(rdr, 'rdr should be an object');
      done();
    });

  });

  suite('run',function(){
    this.timeout(60000);

    setup((done)=>{

      //clean out dir
      fs.emptyDir(dir.out,(e)=>{
        if(e){
          done(e);
        }else{
          rdr=rdr||new Rdr();
          done();
        }
      });

    });

    test.skip('renderDir',(done)=>{
      rdr.renderDir(dir.inp,dir.out).then((r)=>{

        fs.readdir(dir.out,(e,d)=>{

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

    test.skip('renderFile to png',(done)=>{

      rdr.renderFile(
        path.resolve(dir.inp+'/test1.puml'),
        dir.out,
        'png'
      ).then((r)=>{

        fs.readdir(dir.out,(e,d)=>{

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

    test.skip('renderString',(done)=>{

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
        path.resolve(dir.out+'/test4.png'),
        'png'
      ).then((r)=>{

        fs.readdir(dir.out,(e,d)=>{

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

    test.skip('stream png',(done)=>{

      try{

        var rs=fs.createReadStream ( path.resolve(dir.inp+'/test2.puml'),{encoding:'utf8', autoClose: true} );
        var ws=fs.createWriteStream( path.resolve(dir.out+'/test5.png' ) );
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

    test.skip('stream svg',(done)=>{

      var etalon='etalon';
      fs.readFile(path.resolve(dir.rt+'/test5.etalon.svg'),{encoding:"utf8"},(e,r)=>{

        if(e){
          done(e);
          return e;
        }

        etalon=r;

        try{

          var rs=fs.createReadStream ( path.resolve(dir.inp+'/test2.puml'),{encoding:'utf8', autoClose: true} );
          var ws=fs.createWriteStream( path.resolve(dir.out+'/test5.svg' ) );
          var ps=rdr.stream('svg');

          rs
            .pipe(ps)
            .pipe(ws);

          ws.on('error',(e)=>{
            done(e);
          });

          ws.on('finish',()=>{

            fs.readFile(path.resolve(dir.out+'/test5.svg'),{encoding:"utf8"},(e1,r1)=>{

              if(e1){
                done(e1);
                return e1;
              }

              assert.equal(r1,etalon,'checking content generated properly');

              done();

            });

          });

        }catch(e){
          done(e);
        }

      });

    });

    test('relative include path with custom cwd set',(done)=>{

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

        ws.on('error',(e)=>{
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
