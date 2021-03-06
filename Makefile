all: build/build.min.js

deps/ee2/lib/eventemitter2.js:
	git submodule init
	git submodule update

build/build.js: ./lib/main.js deps/ee2/lib/eventemitter2.js
	browserify lib/main.js -o build/build.js

build/build.min.js: build/build.js
	uglifyjs build/build.js -o build/build.min.js -c

clean:
	rm -f build.js build.min.js

docs:
	mkdir -p docs
	dox-foundation -t NAPI.js -T docs -s lib

docs-md:
	markdox lib/main.js -o docs.md

.PHONY: clean docs docs-md

# vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
