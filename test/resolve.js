/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var should = require("should");
var path = require("path");
var resolve = require("../");

var options = {
	loaders: [
		{test: ".load1$", loader: "m2/b"},
		{test: ".load2$", loader: "m1/a!m2/b"}
	]
}

var fixtures = path.join(__dirname, "fixtures");
function testResolve(name, context, moduleName, result) {
	describe(name, function() {
		it("should resolve async correctly", function(done) {
			resolve(context, moduleName, options, function(err, filename) {
				if(err) done(err);
				should.exist(filename);
				filename.should.equal(result);
				done();
			});
		});
		it("should resolve sync correctly", function() {
			var filename = resolve.sync(context, moduleName, options);
			should.exist(filename);
			filename.should.equal(result);
		});
	});
}
function testResolveContext(name, context, moduleName, result) {
	describe(name, function() {
		it("should resolve async correctly", function(done) {
			resolve.context(context, moduleName, {}, function(err, filename) {
				if(err) done(err);
				should.exist(filename)
				filename.should.equal(result);
				done();
			});
		});
		it("should resolve sync correctly", function() {
			var filename = resolve.context.sync(context, moduleName, {});
			should.exist(filename)
			filename.should.equal(result);
		});
	});
}
describe("resolve", function() {
	testResolve("absolute path",
		fixtures, path.join(fixtures, "main1.js"), path.join(fixtures, "main1.js"));

	testResolve("file with .js",
		fixtures, "./main1.js", path.join(fixtures, "main1.js"));
	testResolve("file without extension",
		fixtures, "./main1", path.join(fixtures, "main1.js"));
	testResolve("another file with .js",
		fixtures, "./a.js", path.join(fixtures, "a.js"));
	testResolve("another file without extension",
		fixtures, "./a", path.join(fixtures, "a.js"));
	testResolve("file in module with .js",
		fixtures, "m1/a.js", path.join(fixtures, "node_modules", "m1", "a.js"));
	testResolve("file in module without extension",
		fixtures, "m1/a", path.join(fixtures, "node_modules", "m1", "a.js"));
	testResolve("another file in module without extension",
		fixtures, "complexm/step1", path.join(fixtures, "node_modules", "complexm", "step1.js"));
	testResolve("from submodule to file in sibling module",
		path.join(fixtures, "node_modules", "complexm"), "m2/b.js", path.join(fixtures, "node_modules", "m2", "b.js"));
	testResolve("from submodule to file in sibling of parent module",
		path.join(fixtures, "node_modules", "complexm", "web_modules", "m1"), "m2/b.js", path.join(fixtures, "node_modules", "m2", "b.js"));

	testResolve("file with query",
		fixtures, "./main1.js?query", path.join(fixtures, "main1.js") + "?query");
	testResolve("file in module with query",
		fixtures, "m1/a?query", path.join(fixtures, "node_modules", "m1", "a.js") + "?query");

	testResolve("absolute path with loader",
		fixtures,
		path.join(fixtures, "node_modules", "m1", "a.js") + "!!" + path.join(fixtures, "main1.js"),
		path.join(fixtures, "node_modules", "m1", "a.js") + "!" + path.join(fixtures, "main1.js"));

	testResolve("loader",
		fixtures, "m1/a!./main1.js", path.join(fixtures, "node_modules", "m1", "a.js") + "!" + path.join(fixtures, "main1.js"));
	testResolve("loader with prefix",
		fixtures, "m2/b!./main1.js", path.join(fixtures, "node_modules", "m2-loader", "b.js") + "!" + path.join(fixtures, "main1.js"));
	testResolve("multiple loaders",
		fixtures, "m1/a!m1/b!m2/b!./main1.js", path.join(fixtures, "node_modules", "m1", "a.js") + "!" +
			path.join(fixtures, "node_modules", "m1", "b.js") + "!" +
			path.join(fixtures, "node_modules", "m2-loader", "b.js") + "!" +
			path.join(fixtures, "main1.js"));
	testResolve("multiple loaders with queries",
		fixtures, "m1/a?q1!m1/b?q2!m2/b?q3!./main1.js?q4", path.join(fixtures, "node_modules", "m1", "a.js") + "?q1!" +
			path.join(fixtures, "node_modules", "m1", "b.js") + "?q2!" +
			path.join(fixtures, "node_modules", "m2-loader", "b.js") + "?q3!" +
			path.join(fixtures, "main1.js") + "?q4");

	testResolve("loader without resource",
		fixtures, "m1/a?q1!", path.join(fixtures, "node_modules", "m1", "a.js") + "?q1!");
	testResolve("loader without resource but query",
		fixtures, "m1/a?q1!?q2", path.join(fixtures, "node_modules", "m1", "a.js") + "?q1!?q2");

	testResolve("automatic one loader",
		fixtures, "./file.load1",
		path.join(fixtures, "node_modules", "m2-loader", "b.js") + "!" +
		path.join(fixtures, "file.load1"));
	testResolve("automatic two loader",
		fixtures, "./file.load2",
		path.join(fixtures, "node_modules", "m1", "a.js") + "!" +
		path.join(fixtures, "node_modules", "m2-loader", "b.js") + "!" +
		path.join(fixtures, "file.load2"));
	testResolve("overwrite automatic loader",
		fixtures, "m1/a!./file.load1",
		path.join(fixtures, "node_modules", "m1", "a.js") + "!" +
		path.join(fixtures, "file.load1"));
	testResolve("disable automatic loader",
		fixtures, "!./file.load1",
		path.join(fixtures, "file.load1"));


	testResolveContext("context for fixtures",
		fixtures, "./", fixtures);
	testResolveContext("context for fixtures/lib",
		fixtures, "./lib", path.join(fixtures, "lib"));
	testResolveContext("context with loader",
		fixtures, "m1/a!./", path.join(fixtures, "node_modules", "m1", "a.js") + "!" + fixtures);
	testResolveContext("context with loaders in parent directory",
		fixtures, "m1/a!m2/b.js!../", path.join(fixtures, "node_modules", "m1", "a.js") + "!" +
			path.join(fixtures, "node_modules", "m2-loader", "b.js") + "!" +
			path.join(fixtures, ".."));

	testResolveContext("context for fixtures with query",
		fixtures, "./?query", fixtures + "?query");
	testResolveContext("context with loader and query",
		fixtures, "m1/a?q1!./?q2", path.join(fixtures, "node_modules", "m1", "a.js") + "?q1!" + fixtures + "?q2");
});