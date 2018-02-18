'use strict';

class ServerlessAWSCloudFormationSubVariables {
    constructor(serverless) {
      this.serverless = serverless;
      this.hooks = {
        'aws:package:finalize:mergeCustomProviderResources': this.convertSubVariables.bind(this)
      }
    }

    convertSubVariables() {
        function toYellow(message) {
            return '\u001B[33m' + message + '\u001B[39m';
        }

        function isArray(node) {
            return node.constructor == Array;
        }

        function isObject(node) {
            return node.constructor == Object;
        }

        function isString(node) {
            return node.constructor == String;
        }

        function hasChildren(node) {
            return isArray(node) || isObject(node);
        }

        function recurseNode(node) {
            Object.keys(node).forEach((key) => {
                if (hasChildren(node[key])) {
                    recurseNode(node[key])
                }
                else if (isString(node[key]) && node[key].search(/#{([^}]+)}/) != -1) {
                    consoleLog('Serverless: ' + toYellow(' - \'' + node[key] + '\' => \'{\"Fn::Sub\": \"' + node[key].replace(/#{([^}]+)}/g, '${$1}') + '\"}\''))
                    node[key] = {
                        'Fn::Sub': node[key].replace(/#{([^}]+)}/g, '${$1}')
                    }
                }
            });
        }

        const consoleLog = this.serverless.cli.consoleLog;
        consoleLog('Serverless: ' + toYellow('serverless-cloudformation-sub-variables: Converting AWS CloudFormation Sub variables...'));
        const cfnTemplate = this.serverless.service.provider.compiledCloudFormationTemplate
        recurseNode(cfnTemplate)
    }
}

module.exports = ServerlessAWSCloudFormationSubVariables