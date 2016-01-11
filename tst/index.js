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

suite('ESF-PUML Suite',function(){

  suite('init',function(){

    test('test Dot',(done)=>{

      exec('java -jar '+path.resolve(__dirname+'/../bin/plantuml.8034.jar')+' -testdot',(e,r)=>{
        if(e){
          done(e);
          return e;
        }
        done();
      });

    });

    test('It should init the app',(done)=>{
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
      fs.emptyDir(dir.out,(e)=>{
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
          
          subDirs.forEach((sd)=>{
            wtr.push(new Promise((rs1,rj1)=>{
              
              var subDir=path.resolve(dir.out+'/'+sd);              
              fs.ensureDir(subDir,(e1)=>{
                
                if(e1){
                  rj1(e1);
                  return;
                }
                
                fs.chmod(subDir,'0x666',(e3)=>{

                  if(e3){
                    rj1(e3);
                    return;
                  }

                  rs1();  
                  
                });
                
              });
              
            }));
          });
          
          Promise.all(wtr).then((r2)=>{

            rdr=rdr||new Rdr();
            done();
            
          }).catch((e2)=>{
            
            done(e2);
            
          });
          
        }
      });

    });

    test('renderDir',(done)=>{
      
      const outSubDir='/rdr';
      
      rdr.renderDir(dir.inp,dir.out+outSubDir).then((r)=>{

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

    test('renderFile to png',(done)=>{

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

    test('renderString',(done)=>{

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

    test('stream png',(done)=>{

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

    test('stream svg',(done)=>{

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

        etalon=r;

        try{

          var rs=fs.createReadStream ( path.resolve(dir.inp+'/'+inpFile+'.puml'),{encoding:'utf8', autoClose: true} );
          var ws=fs.createWriteStream( path.resolve(dir.out+outSubDir+'/'+outFile+'.svg' ) );
          var ps=rdr.stream('svg');
          
          //console.log( '\n\noutFile:\n'+path.resolve(dir.out+outSubDir+'/'+outFile+'.svg' )+'\n\n' );

          rs
            .pipe(ps)
            .pipe(ws);

          ws.on('error',(e)=>{
            done(e);
          });

          ws.on('finish',()=>{

            fs.readFile(path.resolve(dir.out+outSubDir+'/'+outFile+'.svg'),{encoding:"utf8"},(e1,r1)=>{

              //console.log('\n\n--- out ---\n');
              //console.log(e1);
              //console.log('\n\n---\n\n');
              //console.log(r1);
              //console.log('\n--- end out ---\n\n');

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
