/*
npm install --global gulp
npm install  gulp gulp-util gulp-sass gulp-uglify gulp-autoprefixer gulp-rename gulp-minify-css gulp-notify imagemin-pngquant gulp-imagemin gulp-concat gulp-plumber browser-sync gulp-rigger gulp-cache --save-dev
 */

/* Needed gulp config */
var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var rigger = require('gulp-rigger');
var plumber = require('gulp-plumber');
var cache = require('gulp-cache');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

/* Html task */
gulp.task('html', function () {
    gulp.src('app/*.html')
        .pipe(rigger())
        .pipe(gulp.dest('app'))
        .pipe(reload({stream: true}));
});

/* Scripts task */
gulp.task('scripts', function() {
  return gulp.src([
    /* Add your JS files here, they will be combined in this order */
    'app/libs/jquery/jquery-1.11.2.js',
    'app/js/common.js'
    ])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('app/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'))
    .pipe(notify({ message: 'Scripts task complete' }))
    .pipe(reload({stream:true}));
});

/* Sass task */
gulp.task('sass', function () {  
    gulp.src('sass/*.sass')
    .pipe(plumber())
    .pipe(sass({
        includePaths: require('node-bourbon').includePaths
    }).on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 15 versions'],
        cascade: false
    }))
    .pipe(rename({suffix: '.min', prefix : '_'}))
    .pipe(minifycss())
    .pipe(gulp.dest('app'))
    .pipe(notify({ message: 'Styles task complete' }))
    /* Reload the browser CSS after every change */
    .pipe(reload({stream:true}));
});

/* Image task */
gulp.task('images', function () {
    return gulp.src('pre-images/*.*')
        .pipe(cache(imagemin({
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        })))
        .pipe(gulp.dest('app/img'))
        .pipe(notify({ message: 'Images task complete' }))
        .pipe(reload({stream: true}));
});

/* Reload task */
gulp.task('bs-reload', function () {
    browserSync.reload();
});

/* Prepare Browser-sync for localhost */
gulp.task('browser-sync', function() {
    browserSync.init(['app/*.css', 'app/js/*.js'], {

        /* For a static server you would use this: */
        
        server: {
            baseDir: 'app'
        }
        
    });
});

/* Watch sass, js and html files, doing different things with each. */
gulp.task('default', ['sass', 'browser-sync'], function () {
    /* Watch sass, run the html task on change. */
    gulp.watch(['app/*.html'], ['html'])
    /* Watch sass, run the sass task on change. */
    gulp.watch(['sass/*.sass'], ['sass'])
    /* Watch app.js file, run the scripts task on change. */
    gulp.watch(['app/js/common.js'], ['scripts'])
    /* Watch image files, run the images task on change. */
    gulp.watch('pre-images/*.*', ['images']);
    /* Watch .html files, run the bs-reload task on change. */
    gulp.watch(['app/*.html'], ['bs-reload'])
});