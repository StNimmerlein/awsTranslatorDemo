import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import iam = require('@aws-cdk/aws-iam');
import s3 = require('@aws-cdk/aws-s3');
import apigw = require('@aws-cdk/aws-apigateway');
import path = require('path');
import { Runtime } from '@aws-cdk/aws-lambda';
import { Duration } from '@aws-cdk/core';
import { PassthroughBehavior } from '@aws-cdk/aws-apigateway';

export class InfrastructureStack extends cdk.Stack {
  private jarLocation = '../../lambda/build/libs/translation-test-1.0-SNAPSHOT-all.jar';

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let bucket = new s3.Bucket(this, 'translationAudio');

    let translateRole = new iam.Role(this, 'translationCaller', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('TranslateReadOnly'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonPollyReadOnlyAccess')
      ]
    });

    let translateLambda = new lambda.Function(this, 'translateText', {
      runtime: Runtime.JAVA_8,
      handler: 'de.marco_sieben.App::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, this.jarLocation)),
      timeout: Duration.seconds(15),
      memorySize: 256,
      role: translateRole,
      environment: {
        AUDIO_FILE_BUCKET_NAME: bucket.bucketName
      }
    });

    let api = new apigw.RestApi(this, 'translateApi');
    const langResource = api.root.addResource('{language}');
    let getIntegration = new apigw.LambdaIntegration(translateLambda, {
      proxy: false,
      passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': '\'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent\'',
          'method.response.header.Access-Control-Allow-Origin': '\'*\'',
          'method.response.header.Access-Control-Allow-Methods': '\'GET\''
        }
      }],
      requestTemplates: {
        'application/json': `{
          "text": "$util.escapeJavaScript($input.params('text')).replaceAll("\\\\'", "'")",
          "targetLanguageCode": "$input.params('language')"
        }`
      }
    });
    langResource.addCorsPreflight({
      allowMethods: ['OPTIONS', 'GET'],
      allowOrigins: ['*']
    });
    langResource.addMethod('GET', getIntegration, {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Methods': true
        }
      }]
    });
  }
}
