var gulp = require('gulp'),
    mincss = require('gulp-mini-css'),//css压缩
    concat = require('gulp-concat'),//文件合并
    uglify = require('gulp-uglify'),//js压缩
    imagemin = require('gulp-imagemin'),//压缩图片
	rename = require('gulp-rename'),
	babel = require("gulp-babel"),
    eslint = require('gulp-eslint'),
    autofx = require('gulp-autoprefixer'),    // css 浏览器前缀补全
    cleanCSS = require('gulp-clean-css'),     // 压缩 css
	changed = require('gulp-changed');

	
var h5_src_js = './src/h5',
    h5_dest_js = './dest/js',
    pc_src_js = './src/pc',
    pc_dest_js = './dest/js',
	src_css = './src/css',
	dest_css = './dest/css';
	
var autofxConfig = {
       browsers: [
          'ie >= 8',
          'ie_mob >= 10',
          'ff >= 30',
          'chrome >= 34',
          'safari >= 7',
          'opera >= 23',
          'ios >= 5',
          'android >= 4.4',
          'bb >= 10'
       ],
       cascade: true,
       remove: true
    };	
var cleanCSSConfig = {
       compatibility: 'ie8',
       keepSpecialComments: '*'
    };	
	
gulp.task('mincss', function () {
    return gulp.src(src_css+'/*.css')
		.pipe(changed(dest_css))
		.pipe(autofx(autofxConfig))
		.pipe(cleanCSS(cleanCSSConfig))
        .pipe(mincss())
		.pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dest_css));
});

gulp.task('minimg', () => {
	return gulp
		.src('./src/images/*.{png,jpg,gif,ico}')
		.pipe(changed('./dest/images'))
		.pipe(imagemin())
		.pipe(gulp.dest('./dest/images'));
})
	
gulp.task('minpcjs', function () {
    return gulp.src(pc_src_js+'/*.js')
        .pipe(concat("pcMerge.min.js"))
		// .pipe(babel({  
        //     presets: ['es2015']  
        // }))
         .pipe(uglify({
			 ie8:true
		 }))
         .pipe(gulp.dest(pc_dest_js));
})	
	
gulp.task('minh5js', function () {
    return gulp.src(h5_src_js+'/*.js')
        .pipe(concat("h5Merge.min.js"))
		// .pipe(babel({  
        //     presets: ['es2015','es2015-ie']  
        // }))
         .pipe(uglify({
			 ie8:true
		 }))
         .pipe(gulp.dest(h5_dest_js));
})

gulp.task('minImg', function(){
    return gulp.src(src_images+'/*')
        .pipe(imagemin())
        .pipe(gulp.dest(dest_images));
});


 gulp.task('default',gulp.series('minh5js','minpcjs','mincss','minimg'));