# serverless-cloudformation-sub-variables
## Serverless framework plugin for easily supporting AWS CloudFormation Sub function variables

Add AWS CloudFormation [Fn::Sub](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html) superpowers to your `serverless.yml`.

This includes:
* Template parameter names e.g. `${SomeParameter}`
* Resource logical IDs e.g. `${SomeResource}`
* Resource attributes e.g. `${SomeResource.Attribute}`
* Pseudo parameters e.g. `${AWS::Region}`
* Literal variables e.g. `${!LiteralVariable}`
* Sub functions with key-value maps

The trick is to use `#{Something}` instead of `${Something}` in your `serverless.yml`.

The plugin, during the package command, converts all the Sub function variables after the serverless variables are referenced and resolved, but before the CloudFormation template is packaged.

As part of the conversion, the `Fn::Sub` wrapper is also added to the string. That is, something like `#{Foo}-Bar-#{AWS::Region}` is converted to `{"Fn::Sub": "${Foo}-Bar-${AWS::Region}"}`. If `Fn::Sub` is already included in the direct parent node that contains the string with Sub function variables, then the `Fn::Sub` wrapper is not added (this is the case when declaring Sub functions with key-value maps or when you want to be more explicit in your `serverless.yml`).

This means that you can turn something like this:
```yaml
service: awesome-service

plugins:
  - serverless-cloudformation-sub-variables
...
resources:
...
  Resources:
    SomeResource:
      Properties:
        SomeProperty:
          Fn::Sub:
          - '#{CustomVariable}-XYZ'
          - CustomVariable:
              Fn::ImportValue: ABC-#{AWS::StackName}
  Outputs:
    MyBaseURL:
      Value: https://#{ApiGatewayRestApi}.execute-api.#{AWS::Region}.amazonaws.com/${self:provider.stage}
      Export:
        Name: MyBaseURL
...
```

Into something like this:
```json
...
  "Resources": {
    "SomeResource": {
      "Properties": {
        "SomeProperty": {
          "Fn::Sub": [
            "${CustomVariable}-XYZ",
            {
              "CustomVariable": {
                "Fn::ImportValue": {
                  "Fn::Sub": "ABC-${AWS::StackName}"
                }
              }
            }
          ]
        }
      }
    }
  }
  "Outputs": {
    "MyBaseURL": {
      "Value": {
        "Fn::Sub": "https://${ApiGatewayRestApi}.execute-api.${AWS::Region}.amazonaws.com/dev"
      },
      "Export": {
        "Name": "MyBaseURL"
      }
    }
  }
...
```
This works with anything in your `serverless.yml` that ends up in the Serverless service's CloudFormation template, including the Resources and Outputs sections _(and virtually every other location where Fn::Sub is supported)_.

## Getting Started
1. Install plugin from npm:
```shell
npm install serverless-cloudformation-sub-variables
```
2. Add to the `plugins` section of your `serverless.yml`:
```yaml
plugins:
  - serverless-cloudformation-sub-variables
```
3. Include strings in your `serverless.yml` that have Sub variables as `#{Something}` instead of `${Something}`

## More Info
Took a bit of inspiration from the following Serverless plugins, while looking for a more generic and simpler way to convert all kinds of non-custom `Fn::Sub` variables, anywhere in the Serverless service's CloudFormation template:
* [serverless-pseudo-parameters](https://github.com/svdgraaf/serverless-pseudo-parameters)
* [serverless-cf-vars](https://gitlab.com/kabo/serverless-cf-vars)


