"use strict";

var gulp = require('gulp'),
		pug = require('gulp-pug'),
		sass = require('gulp-sass'),
		concat = require('gulp-concat'),
		plumber = require('gulp-plumber'),
		prefix = require('gulp-autoprefixer'),
		imagemin = require('gulp-imagemin'),
		browserSync = require('browser-sync').create();

var useref = require('gulp-useref'),
		gulpif = require('gulp-if'),
		cssmin = require('gulp-clean-css'),
		uglify = require('gulp-uglify'),
		rimraf = require('rimraf'),
		notify = require('gulp-notify'),
		ftp = require('vinyl-ftp');

/**
*  SPRITE
**/
var svgsprite = require('gulp-svg-sprites'),
		svgmin = require('gulp-svgmin'),
		svg2png = require('gulp-svg2png'),
		filter = require('gulp-filter');

var paths = {
			dev: 'dev/',
			devDir: 'app/',
			outputDir: 'build/'
		};


/*********************************
		Developer tasks
*********************************/

//pug compile
gulp.task('pug', function() {
	return gulp.src([paths.dev + '*.pug', '!' + paths.dev + '_base.pug' ])
		.pipe(plumber())
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest(paths.devDir))
		.pipe(browserSync.stream())
});

//sass compile
gulp.task('sass', function() {
	return gulp.src(paths.dev + '/*.sass')
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix({
			browsers: ['last 10 versions'],
			cascade: true
		}))
		.pipe(gulp.dest(paths.devDir + 'css/'))
		.pipe(browserSync.stream());
});

//svg sprite compile
gulp.task('svgSprite', function() {
	gulp.src(paths.dev + '/svg-sprite/*.svg')
	.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
	.pipe(svgsprite({
		baseSize: 12,
		preview: false,
		svgPath: '../../img/svg/sprite.svg',
		pngPath: '../../img/svg/sprite.png',
		templates: {
			css: require("fs").readFileSync('svg_sprite_tmpl.scss', "utf-8")
		},
		svg: {
				symbols: 'symbol_sprite.svg'
		},
		cssFile: '../../'+paths.dev + '_base/_svg_sprite.scss',

	}))
	.pipe(gulp.dest(paths.devDir +'img'))
	.pipe(filter('**/*.svg'))
	.pipe(svg2png())
	.pipe(gulp.dest(paths.devDir +'img'));
});


//js compile
gulp.task('scripts', function() {
	return gulp.src([
			paths.dev + '**/*.js',
			'!' + paths.dev + '_assets/**/*.js'
		])
		.pipe(concat('main.js'))
		.pipe(gulp.dest(paths.devDir + 'js/'))
		.pipe(browserSync.stream());
});

//watch
gulp.task('watch', function() {
	gulp.watch(paths.dev + '**/*.pug', ['pug']);
	gulp.watch(paths.dev + '**/*.sass', ['sass']);
	gulp.watch(paths.dev + '**/*.js', ['scripts']);
	gulp.watch(paths.dev + '**/*.svg', ['svgSprite']);
});

//server
gulp.task('browser-sync', function() {
	browserSync.init({
		port: 3000,
		server: {
			baseDir: paths.devDir
		}
	});
});




/*********************************
		Production tasks
*********************************/

//clean
gulp.task('clean', function(cb) {
	rimraf(paths.outputDir, cb);
});

//css + js
gulp.task('buildCssJs', ['clean'], function () {
	return gulp.src(paths.devDir + '*.html')
		.pipe( useref() )
		.pipe( gulpif('*.js', uglify()) )
		.pipe( gulpif('*.css', cssmin()) )
		.pipe( gulp.dest(paths.outputDir) );
});

//copy images to outputDir
gulp.task('imgBuild', ['clean'], function() {
	return gulp.src(paths.devDir + 'img/**/*.*')
		.pipe(imagemin())
		.pipe(gulp.dest(paths.outputDir + 'img/'));
});

//copy fonts to outputDir
gulp.task('fontsBuild', ['clean'], function() {
	return gulp.src(paths.devDir + '/fonts/**/*')
		.pipe(gulp.dest(paths.outputDir + 'fonts/'));
});

//ftp
gulp.task('send', function() {
	var conn = ftp.create({
		host:     '77.120.110.166',
		user:     'alexlabs',
		password: 'Arj4h00F9x',
		parallel: 5
	});

	/* list all files you wish to ftp in the glob variable */
	var globs = [
		'build/**/*',
		'!node_modules/**' // if you wish to exclude directories, start the item with an !
	];

	return gulp.src( globs, { base: '.', buffer: false } )
		.pipe( conn.newer( '/' ) ) // only upload newer files
		.pipe( conn.dest( '/' ) )
		.pipe(notify("Dev site updated!"));

});


//default
gulp.task('default', ['browser-sync', 'watch', 'pug', 'sass', 'scripts', 'svgSprite']);

//production
gulp.task('build', ['buildCssJs', 'imgBuild', 'fontsBuild']);