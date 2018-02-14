node_modules/@financial-times/n-gage/index.mk:
	npm install --no-save --no-package-lock @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

unit-test:
	export LOGOUT_URL='https://accounts.ft.com/logout'; \
	mocha 'test/**/*.spec.js' --inline-diffs  --timeout 10000

test:
	make verify
	make unit-test
	# make a11y
