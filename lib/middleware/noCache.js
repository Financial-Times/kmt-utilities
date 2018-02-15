const NO_CACHE = 'private, max-age=0, no-cache, no-store, must-revalidate';

module.exports = (req, res, next) => {
	res.set('Cache-Control', NO_CACHE);
	res.set('Surrogate-Control', NO_CACHE);
	next();
};
