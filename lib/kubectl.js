'use strict';

const exec = require('child_process').exec;

const Util = require('./util');

class Kubectl {
  constructor(options) {
    this.options = options;
  }

  _command(args) {
    if (this.options.context) {
      return `kubectl --context ${this.options.context} ${args}`;
    }

    return `kubectl ${args}`;
  }

  exists(ns, type, name) {
    return Util.run(this._command(`--namespace ${ns} get ${type} ${name}`))
      .then(Promise.resolve(true))
      .catch(error => {
        if (error.toString().indexOf('not found') > -1) {
          return Promise.resolve(false);
        }

        throw error;
      });
  }

  deploy(ns, type, name, resource) {
    console.log('deploying:', type, name);
    return this.exists(ns, type, name).then(exists => {
      return new Promise((res, rej) => {
        let child;
        let handler = (error, stdout) => {
          if (error) {
            return rej(error);
          }

          res(stdout);
        };

        if (exists) {
          child = exec(this._command(`--namespace ${ns} apply -f -`), handler);
        } else {
          child = exec(this._command(`--namespace ${ns} create -f -`), handler);
        }

        child.stdin.write(JSON.stringify(resource));
        child.stdin.end();
      });
    });
  }
}

module.exports = Kubectl;