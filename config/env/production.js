'use strict';

module.exports = {
    db: process.env.MONGOLAB_URI,
    assets: {
        lib: {
            css: [
                'public/lib/textAngular/src/textAngular.css',
            ],
            js: [
                'public/lib/angular-cookies/angular-cookies.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-touch/angular-touch.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/lib/lodash/lodash.min.js',
                'public/lib/textAngular/dist/textAngular-rangy.min.js',
                'public/lib/textAngular/dist/textAngular-sanitize.min.js',
                'public/lib/textAngular/dist/textAngular.min.js',
                'public/lib/ng-file-upload/ng-file-upload.min.js',
                'public/lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js',
                'public/lib/papaparse/papaparse.min.js',
                'public/lib/angular-recaptcha/release/angular-recaptcha.min.js'
            ]
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
    },
    mailer: {
        from: 'Alumni Affairs <emeza@prepforprep.org>',
        options: {
            service: process.env.MAILER_SERVICE_PROVIDER,
            auth: {
                user: process.env.MAILER_EMAIL_ID,
                pass: process.env.MAILER_PASSWORD
            }
        }
    }
};