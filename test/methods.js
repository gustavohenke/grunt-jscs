"use strict";

var fixture, errors,
    grunt = require( "grunt" ),
    JSCS = require( "../tasks/lib/jscs" ).init( grunt ),

    proto = JSCS.prototype,

    hooker = require( "hooker" );

module.exports = {
    setUp: function( done ) {
        fixture = new JSCS({
            config: "test/configs/fail.json"
        });

        fixture.check( "test/fixtures/fixture.js" ).then(function( collection ) {
            fixture.setErrors( errors = collection );
            done();
        });
    },

    getConfig: function( test ) {
        var result,
            config = {
                config: "test/configs/example.json"
            };

        result = proto.getConfig( config );
        test.equal( result.example, "test", "should find config at local path" );

        config.config = process.cwd() + "/" + config.config;
        result = proto.getConfig( config );
        test.equal( result.example, "test", "should find config at absolute path" );

        config = {
            requireCurlyBraces: [ "if" ],
            config: "test.js"
        };

        result = proto.getConfig( config );

        test.ok( !result.example, "should have find config file with inline option" );
        test.ok( !result.config, "config option should have been removed" );
        test.ok( Array.isArray( result.requireCurlyBraces ),
                "\"requireCurlyBraces\" option should have been preserved" );

        config = {
            requireCurlyBraces: [ "if" ],
        };

        test.ok( Array.isArray( result.requireCurlyBraces ),
                "\"requireCurlyBraces\" option should have been preserved" );

        test.done();
    },

    "getConfig error with empty object": function( test ) {
        hooker.hook( grunt, "fatal", {
            pre: function( message ) {
                test.equal( message, "Nor config file nor inline options was found" );

                test.done();
                return hooker.preempt();
            },

            once: true
        });

        proto.getConfig({});
    },

    "getConfig error with incorrect config": function( test ) {
        hooker.hook( grunt, "fatal", {
            pre: function( message ) {
                test.equal( message, "The config file \"not-existed\" was not found" );

                test.done();
                return hooker.preempt();
            },

            once: true
        });

        proto.getConfig({
            config: "not-existed"
        });
    },

    findConfig: function( test ) {
        var result;

        result = proto.findConfig( "test/configs/example.json" );

        test.equal( result.example, "test", "should find config at local path" );

        result = proto.findConfig( process.cwd() + "/" + "test/configs/example.json" );
        test.equal( result.example, "test", "should find config at absolute path" );

        test.done();
    },

    getOptions: function( test ) {
        var options = proto.getOptions({
            requireCurlyBraces: [ "if" ],
            config: "test.js"
        });

        test.ok( !options.config, "should remove task option" );
        test.ok( !proto.getOptions({}), "should return false if empty object was passed" );

        test.done();
    },

    registerReporter: function( test ) {
        var jscs = new JSCS({
            requireCurlyBraces: [],
        });

        test.equal( typeof jscs.getReporter(), "function", "should register default reporter" );

        jscs = new JSCS({
            requireCurlyBraces: [],
            reporter: "checkstyle"
        });

        test.equal( typeof jscs.getReporter(), "function",
            "should register reporter from jscs package" );

        jscs = new JSCS({
            requireCurlyBraces: [],
            reporter: "test/test-reporter.js"
        });

        test.equal( jscs.getReporter()(), "test", "should register reporter as npm module" );

        test.done();
    },

    count: function( test ) {
        test.equal( fixture.count( errors ), 1, "should correctly count errors" );

        test.done();
    },

    report: function( test ) {
        hooker.hook( grunt.log, "writeln", {
            pre: function( message ) {
                test.ok( message.length, "Reporter report something" );
                test.done();

                return hooker.preempt();
            },

            once: true
        });

        fixture.report();
    },

    notify: function( test ) {
        hooker.hook( grunt.log, "error", {
            pre: function( message ) {
                test.ok( message, "1 code style errors found!" );
                test.done();

                return hooker.preempt();
            },

            once: true
        });

        fixture.notify();
    },

    excludes: function( test ) {
        var jscs = new JSCS({
            "requireCurlyBraces": [ "while" ],
            "excludeFiles": [ "test/fixtures/exclude.js" ]
        });

        jscs.check( "test/fixtures/exclude.js" ).then(function( errors ) {
            test.equal( jscs.count( errors ), 0, "should not find any errors in excluded file" );
            test.done();
        });
    },

    additional: function( test ) {
         var jscs = new JSCS({
            "additionalRules": [ "test/rules/*.js" ],
            "testAdditionalRules": true
        });

        jscs.check( "test/fixtures/fixture.js" ).then(function( errorsCollection ) {
            errorsCollection.forEach(function( errors ) {
                errors.getErrorList().forEach(function( error ) {
                    test.equal( error.message, "test", "should add additional rule");
                });
                test.done();
            });
        });
    }
};
