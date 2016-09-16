/**
 * Created by Denis Bondarenko <bond.den@gmail.com> on 29.07.2015.
 */
"use strict";

//todo: implement ESF coding standards
var
  fs      = require('fs-extra'),
  path    = require('path'),
  stream  = require('stream'),
  exec    = require('child_process').exec,
  svgoMod = require('svgo')
  ;

export class PumlRenderer{

  constructor(){

    var H=this;

    this.pumlJar='bin/plantuml.jar';
    this.jarPth =path.resolve(__dirname+'/'+this.pumlJar);

    this.supportedFormats={
      svg:'-tsvg',
      eps:'-teps',
      png:''
    };

    /**
     * private methods
     * @type {Object}
     */
    this._={

      setFmt       :function(fmt='svg'){

        let fmtOpt=H.supportedFormats.svg;
        if(H.supportedFormats.hasOwnProperty(fmt)){
          fmtOpt=H.supportedFormats[fmt];
        }

        return fmtOpt;

      },

      customCwd    :function(buf,cwd){

        let s=buf.toString('utf8');

        let rxs='!include ((((\.\/)?(\.\.\/)+)|(\.\/(\.\.\/)*))((.+)[\r\n]))';
        let m=s.match(new RegExp(rxs,'ig'));
        if(m){

          m.forEach((v,i,a)=>{

            let before=v;
            let m1=before.match(new RegExp(rxs,'i'));
            if(m1 && m1.length && m1.length>1){

              let after=before.replace(
                before,
                '!include '+path.resolve(cwd+'/'+m1[1].replace(/[\/\\]/gi,path.sep))
              );

              s=s.replace(before,after);

            }

          });
        }

        return new Buffer(s,'utf8');

      },

      createQryDir :function(inpDir,outDir,fmt='svg'){

        return  'java -jar '+H.jarPth+' ' +
                '-charset "utf8" ' +
                H._.setFmt(fmt) +' '+
                '-o "'+outDir+'" "'+path.resolve(inpDir+'/**.puml')+'"';

      },

      createQryFile:function(inp,out,fmt='svg'){

        return  'java -jar '+H.jarPth+' ' +
                '-charset "utf8" ' +
                H._.setFmt(fmt) +' '+
                '-o "'+out+'" "'+inp+'"';

      },

      createQryStr:function(inpStr,outFile,fmt='svg'){

        return  'java -jar '+H.jarPth+' ' +
                '-charset "utf8" ' +
                H._.setFmt(fmt) +' '+
                '-pipe > "'+outFile+'"';

      },

      createQryStm:function(fmt='svg'){

        return  'java -jar '+H.jarPth+' ' +
                '-charset "utf8" ' +
                H._.setFmt(fmt) +' '+
                '-pipe';

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
  renderDir(inpDir,outDir){
    var H=this;
    return new Promise((rs,rj)=>{

      var t=setInterval(()=>{
        process.stdout.write(' ->');
      },1000);

      exec(
        H._.createQryDir(inpDir,outDir),
        {
          encoding:"utf8"
        },
        (e,r)=>{
          if(e){
            clearInterval(t);
            rj(e);
            return e;
          }
          clearInterval(t);
          rs(true);
        }
      );
    });
  }

  cleanSvgFile(fileOut){
    //var H=this;
    return new Promise((rs,rj)=>{

      fs.readFile(fileOut,'utf8',(e1,r1)=>{

        if(e1){
          rj(e1);
          return e1;
        }

        let svgo=new svgoMod({
          plugins: [
            {
              cleanupIDs: false
            }
          ]
        });
        svgo.optimize(r1,r2=>{

          if(!r2){
            let e2=new Error('SVG Optimisation Error');
            rj(e2);
            return e2;
          }

          let format=path.extname(fileOut);
          fileOut=path.resolve(fileOut.replace(format,'opt'+format));

          fs.writeFile(fileOut,r2.data,(e3,r3)=>{

            if(e3){
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
  renderFile(fileIn,dirOut,format='svg'){
    var H=this;
    return new Promise((rs,rj)=>{

      exec(
        H._.createQryFile(fileIn,dirOut,format),
        {
          encoding:"utf8"
        },
        (e,r)=>{

          if(e){
            rj(e);
            return e;
          }

          let fileOutBase=path.basename(fileIn,'.puml');
          let fileOut    =path.resolve(dirOut+'/'+fileOutBase+'.'+format);

          if(format==='svg'){

            H.cleanSvgFile(fileOut).then(r=>{
              rs(fileOut);
            }).catch((e)=>{
              rj(e);
              return e;
            });

          }else{
            rs(fileOut);
          }

        }
      );

    });
  }

  renderString(strIn,fileOut,format='svg'){
    var H=this;
    return new Promise((rs,rj)=>{

      let qry=H._.createQryStr(strIn,fileOut,format);
      let pcs=exec(qry);

      pcs.stdin.write(strIn,e=>{
        if(e){
          rj(e);
        }
        pcs.stdin.end();
      });

      pcs.on('error',e=>{
        rj(e);
        return e;
      });

      pcs.stderr.on('data',data=>{
        rj('stderr: '+data);
        return 1;
      });

      pcs.on('close', (code)=>{
        if(code!==0){
          rj(new Error(qry+' exited with code '+code));
        }else{
          rs(code);
        }
      });

    });
  }

  renderStringToString(strIn,format='svg'){
    var H=this;
    return new Promise((rs,rj)=>{

      let out='';
      let qry=H._.createQryStm(format);
      let pcs=exec(qry);

      pcs.stdin.write(strIn,e=>{
        if(e){
          rj(e);
        }
        pcs.stdin.end();
      });

      pcs.on('error',e=>{
        rj(e);
        return e;
      });

      pcs.stderr.on('data',d=>{
        rj('stderr: '+d);
        return 1;
      });

      pcs.on('close', code=>{
        if(code!==0){
          rj(new Error(qry+' exited with code '+code));
        }else{
          rs(code);
        }
      });

      pcs.stdout.on('data', d=>{
        out+=d;
      });

      pcs.stdout.on('end',()=>{
        rs(out);
      });

    });
  }

  /**
   * Renders a stream of utf8-encoded puml code to selected format. Currently supported SVG
   * @param  {string} format='svg' format of rendered image, supported formats: SVG. Default: SVG. Optional
   * @param  {string} cwd.         custom CWD. Deault: null. Optional
   * @return {stream.Duplex}       returns a duplex stream, that can be piped in and out.
   */
  stream(format='svg',cwd=null){

    var H=this;

    let pcs=exec(this._.createQryStm(format));

    let stm=stream.Duplex({
      read:function(n){
        //console.log('To read: '+n);
      },
      write:function(d, encoding, next){

        if(cwd){
          d=H._.customCwd(d,cwd);
        }

        pcs.stdin.write(d,null,()=>{
          pcs.stdin.end();
        });

      }
    });

    pcs.stdout.on('data', d=>{
      stm.push(d);
    });

    pcs.stdout.on('end',()=>{
      stm.push(null);
    });

    pcs.stderr.on('data',v=>{
      stm.push(null);
    });

    pcs.on('error', e=>{
      stm.push(null);
    });

    pcs.on('close', ()=>{
      stm.push(null);
    });

    return stm;

  }

}
