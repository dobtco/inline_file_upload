module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.initConfig
    pkg: '<json:package.json>'

    coffee:
      all:
        src: 'src/inline_file_upload.coffee'
        dest: 'dist/inline_file_upload.js'
        options:
          bare: true

    watch:
      all:
        files: ['src/inline_file_upload.coffee']
        tasks: 'default'

  grunt.registerTask 'default', ['coffee:all']
