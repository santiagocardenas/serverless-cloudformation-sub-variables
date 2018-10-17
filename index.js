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

        function isNull(node) {
            return node === null;
        }

        function isUndefined(node) {
            return node === undefined;
        }

        function isNil(node) {
            return isNull(node) || isUndefined(node);
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

        function isSubFunction(keyName) {
            return keyName == 'Fn::Sub'
        }

        function recurseNode(node, subFunctionChild) {
            Object.keys(node).forEach((key) => {
                if (isNil(node[key])) {
                    return;
                }
                if (hasChildren(node[key])) {
                    recurseNode(node[key], isSubFunction(key) ? true : false)
                }
                else if (isString(node[key]) && node[key].search(/#{([^}]+)}/) != -1) {
                    let convertedNodeValue = node[key].replace(/#{([^}]+)}/g, '${$1}')
                    if (subFunctionChild) {
                        consoleLog('Serverless: ' + toYellow(' - \'' + node[key] + '\' => \'' + node[key].replace(/#{([^}]+)}/g, '${$1}') + '\''))
                        node[key] = convertedNodeValue
                    }
                    else {
                        consoleLog('Serverless: ' + toYellow(' - \'' + node[key] + '\' => \'{\"Fn::Sub\": \"' + node[key].replace(/#{([^}]+)}/g, '${$1}') + '\"}\''))
                        node[key] = {
                            'Fn::Sub': convertedNodeValue
                        }
                    }
                }
            });
        }

        const consoleLog = this.serverless.cli.consoleLog;
        consoleLog('Serverless: ' + toYellow('serverless-cloudformation-sub-variables: Converting AWS CloudFormation Sub variables...'));
        const cfnTemplate = this.serverless.service.provider.compiledCloudFormationTemplate
        recurseNode(cfnTemplate, false)
    }
}

module.exports = ServerlessAWSCloudFormationSubVariables