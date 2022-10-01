import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {aws_ssm as _ssm} from 'aws-cdk-lib'
import { aws_secretsmanager as _secretmanager } from 'aws-cdk-lib';

export class CustomParametersSecretsStack extends Stack {

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props)


        var param1 = new _ssm.StringParameter(this,"ssmParam1", {
            allowedPattern: '^[0-9]*$',  //Allowing only numbers
            stringValue: '100',
            description: "My app configuration",
            parameterName: '/app/myApplication_dev/NoOfConcurrentUsers',
            tier: _ssm.ParameterTier.STANDARD
        })
        
        var output1 = new CfnOutput(this,"param1Out",  
         {value: param1.stringValue, description: 'No of concurrent users'})


        var secret1 = new  _secretmanager.Secret(this,"DbSecret", {
            secretName: 'DbPassword',
            description: "Database password",

        })

        const templatedSecret = new _secretmanager.Secret(this, 'TemplatedSecret', {
            generateSecretString: {
              secretStringTemplate: JSON.stringify({ username: 'postgres' }),
              generateStringKey: 'password',
            },
          });
        
        var output2 = new CfnOutput(this,"Secret1Out",  
        {value: "${secret1.secretValue}", description: 'Database password'})




    }
}