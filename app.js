/**
 * Bitbucket backup script
 * Helps you backup all your bitbucket repositories to a local folder
 *
 * Usage: node app --user=bbUser --pass=bbPass --owner=companyOrUserName --folder=./backup
 *
 * --folder is optional. It defaults to ./bb-backup
*/
var path = require('path');
var async = require('async');
var argv = require('named-argv');
var request = require('request');
var exec = require('child_process').exec;

// Check the incoming params
if (!argv.opts || !argv.opts.owner || !argv.opts.user || !argv.opts.pass) {
	console.log('You must pass --owner, --user and --pass options. Exiting.');
	process.exit(1);
}

var url = 'https://api.bitbucket.org/2.0/repositories/' + argv.opts.owner;
var auth = {
		user: argv.opts.user,
		pass: argv.opts.pass
};

var backupFolder = argv.opts.folder || './bb-backup';
backupFolder = path.normalize(backupFolder + '/');

// Get all repos from Bitbucket
getAllRepos(url, auth, function (error, repos) {
	if (error) {
		throw error;
	}

	console.log('Got %d repos. Processing...', repos.length);

	// Iterate over all repos, clone each to local folder
	async.eachLimit(repos, 5, function (repo, callback) {
		console.log('Cloning', repo.name);

		// Choose between git and mercurial
		var command = repo.scm == 'git' ? 'git' : 'hg';
		exec(command + ' clone ' + repo.links.clone[0].href + ' ' + backupFolder + repo.name.replace(/\ /g, '\\ '), callback);
	});
});

/**
 * Get all repositories from the specified url
 *
 * @callback processCallback
 * @param {Object} error
 * @param {Array} repos - list of repositories
 *
 * @param {String} url - Bitbucket API url
 * @param {Object} auth - Object containing bitbucket username and password
 * @param {processCallback} callback
*/
function getAllRepos (url, auth, callback) {
	var repos = [];
	var apiUrl = url;

	// Iterate bitbucket pages, collect all repositories to repos array
	async.doWhilst(
		function (callback) {
			request.get(apiUrl, {auth: auth}, function (error, response, body) {
				var json = null;

				try {
					json = JSON.parse(body);
				}
				catch (exc) {
					return callback(exc);
				}

				repos = repos.concat(json.values);
				apiUrl = json.next;
				callback();
			});
		},

		function () {
			// Keep iterating until apiUrl (json.next) exists
			return !!apiUrl;
		},

		function (error) {
			callback(error, repos);
		}
	);
}
