'use strict';

module.exports = {
    db: 'mongodb://localhost/pfpaa-dev',
    app: {
        title: 'Alumni Association Election - Development Environment'
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