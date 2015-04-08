"use strict";

var grunt = require( "grunt" );

grunt.file.setBase( "test/enmasse" );

exports.fail = function( test ) {
    grunt.util.spawn( {
        cmd: "grunt",
        args: [ "jscs:fail" ]
    }, function( error, result ) {
        test.equal( result.code, 3 );

        test.done();
    } );
};

exports.broken = function( test ) {
    grunt.util.spawn( {
        cmd: "grunt",
        args: [ "jscs:broken" ]
    }, function( error, result ) {
        test.equal( result.code, 3 );

        test.done();
    } );
};

exports.force = function( test ) {
    grunt.util.spawn( {
        cmd: "grunt",
        args: [ "jscs:force" ]
    }, function( error, result ) {
        test.equal( result.code, 0 );

        test.done();
    } );
};

exports.forceAndFatal = function( test ) {
    grunt.util.spawn( {
        cmd: "grunt",
        args: [ "jscs:force", "fatal" ]
    }, function( error, result ) {
        test.equal( result.code, 1 );

        test.done();
    } );
};

exports.success = function( test ) {
    grunt.util.spawn( {
        cmd: "grunt",
        args: [ "jscs:success" ]
    }, function( error, result ) {
        test.equal( result.code, 0 );

        test.done();
    } );
};

exports.onlyInline = function( test ) {
    grunt.util.spawn( {
        cmd: "grunt",
        args: [ "jscs:only-inline" ]
    }, function( error, result ) {
        test.equal( result.code, 0 );

        test.done();
    } );
};

exports.merge = function( test ) {
    grunt.util.spawn( {
        cmd: "grunt",
        args: [ "jscs:merge" ]
    }, function( error, result ) {
        test.ok( result.stdout.indexOf( "curly" ) > 0 );
        test.ok( result.stdout.indexOf( "Illegal keyword:" ) > 0 );
        test.equal( result.code, 3 );

        test.done();
    } );
};

exports.dot = function( test ) {
    grunt.util.spawn( {
        cmd: "grunt",
        args: [ "jscs:dot" ]
    }, function( error, result ) {
        test.equal( result.code, 3 );

        // Should get two errors
        test.equal( result.stdout.split( "Illegal keyword: with" ).length, 3 );

        test.done();
    } );
};

exports.fix = fixable( true );
exports.fixFail = fixable( false );

function fixable( expectFailure ) {
    return function( test ) {
        grunt.file.copy( "../fixtures/fixable.source.js", "../fixtures/fixable.js" );
        grunt.util.spawn( {
            cmd: "grunt",
            args: [ expectFailure ? "jscs:fix-fail" : "jscs:fix" ]
        }, function( error, result ) {
            if ( expectFailure ) {
                test.equal( result.code, 3 );

                // Should get three errors
                test.equal( result.stdout.match( /Expected indentation of/g ).length, 3 );
            } else {
                test.equal( result.code, 0, result.stdout );
            }

            test.done();
        } );
    };
}
