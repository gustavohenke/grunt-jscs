module.exports = function() {};

module.exports.prototype = {

    configure: function() {
    },

    getOptionName: function () {
        return "testAdditionalRules";
    },

    check: function(file, errors) {
        errors.add( "test", file.getProgram() );
    }
};
