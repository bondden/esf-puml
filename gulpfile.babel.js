/**
 * Created by Denis Bondarenko <bond.den@gmail.com> on 08.05.2015.
 */
'use strict';

var
  gulp   =require('gulp'),
  changed=require('gulp-changed'),
  rename =require('gulp-rename'),
  srcmaps=require('gulp-sourcemaps'),
  babel  =require('gulp-babel'),
  eslint =require('gulp-eslint'),
  mocha  =require('gulp-mocha'),
  //plumber=require('gulp-plumber'),
  path   =require('path')
  ;

var d    ={
  "js": {
    "src": 'src/*.es7.js',
    "dst": './',
    "maps":'.maps/'
  },
  "tst":{
    "main":'tst/index.js'
  }
};

gulp.task('bld',()=>{
  return gulp
    .src(d.js.src)
    //.pipe(plumber())
    .pipe(changed(d.js.dst))
    .pipe(srcmaps.init())
    .pipe(eslint())
    .pipe(babel())
    .pipe(srcmaps.write(d.js.maps))
    .pipe(rename((path)=>{
      path.basename=path.basename.replace('.es7','');
    }))
    .pipe(gulp.dest(d.js.dst));
});

gulp.task('tst',['bld'],()=>{
  return gulp
    .src(d.tst.main,{read:false})
    .pipe(mocha({
      reporter:'spec',
      ui:      'tdd'
    }));
});

gulp.task('debug',['bld'],()=>{

});

gulp.task('watch',()=>{
  gulp.watch(d.js.src,['bld']);
});

gulp.task('default',['watch','bld']);

//aliases for backward compatibility
gulp.task('test',['tst']);
gulp.task('js',['bld']);
