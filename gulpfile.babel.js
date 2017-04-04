import gulp  from 'gulp';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import crx from 'gulp-crx-pack';
import fs from 'fs';

import manifest from './src/manifest.json';

gulp.task('crx', ['prepackage'], () => {
    const codebase = '';
    const updateXmlFilename = '';

    return gulp.src('./dist')
        .pipe(crx({
            privateKey: fs.readFileSync('./src/key.pem', 'utf8'),
            filename: manifest.name + '.crx',
            codebase: codebase,
            updateXmlFilename: updateXmlFilename
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('build', ['move'], () => {
    gulp.src('./src/*.js')
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', () => {
    gulp.watch('./src/*.js', ['build']);
});

gulp.task('move', () => {
    gulp.src("./src/*.json")
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['move', 'build', 'watch']);
gulp.task('prepackage', ['move', 'build']);