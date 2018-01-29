const envVars = process.env;
module.exports = {
	NODE_ENV: envVars.NODE_ENV,
	KMT_SECRET: envVars.KAT_KMT_SECRET || envVars.KMT_SECRET,
	KAT_ERROR_PATH: envVars.KAT_KAT_ERROR_PATH || envVars.KAT_ERROR_PATH || '/error',
	IGNORE_AUTH_TOKEN: envVars.KAT_IGNORE_AUTH_TOKEN || envVars.IGNORE_AUTH_TOKEN || false,
	HOST: envVars.KAT_HOST || envVars.HOST,
	LOGOUT_URL: envVars.KAT_LOGOUT_URL || envVars.LOGOUT_URL,
	BASE_PATH_URL: envVars.KAT_BASE_PATH_URL || envVars.BASE_PATH_URL,
	BASE_PATH_ROUTE: envVars.BASE_PATH_ROUTE,
	DEV_ADD_LIVERELOAD: envVars.DEV_ADD_LIVERELOAD,
	LIVERELOAD_PORT: envVars.LIVERELOAD_PORT,
	FEEDBACK_ROUTE: envVars.FEEDBACK_ROUTE || '#',
	FOOTER_THEME: envVars.FOOTER_THEME || 'theme-dark',
	FOOTER_TYPE: envVars.FOOTER_TYPE || 'short',
	FOOTER_PADDING_TOP : envVars.FOOTER_PADDING_TOP || 10,
	FOOTER_HELP_LINK : envVars.FOOTER_HELP_LINK || 'http://help.ft.com/help/b2b-support/knowledge-administration-tool/'
};
