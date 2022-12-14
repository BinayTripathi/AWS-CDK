#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as _core from 'aws-cdk-lib/core';
import { CdkLearnStack } from '../lib/cdk-learn-stack';
import {CustomVpcStack} from '../lib/resources/VPC/custom-vpc-stack';
import { CustomEC2Stack } from '../lib/resources/CustomEC2/custom-ec2-stack';
import { WebServerStack } from '../lib/resources/ALB/WebServerStack';
import { BastionHost } from '../lib/resources/CustomEC2/BastionHost';
import { CustomParametersSecretsStack } from '../lib/resources/ParameterStore/custom-parameters-secrets-stack'
import {IamRoleWithPolicies} from '../lib/resources/Iam/IAM-Role-Policy';

const app = new cdk.App();

//const envEU  = { account: '2383838383', region: 'eu-west-1' };
//const envUSA = { account: '8373873873', region: 'us-west-2' };
var allEnvs = app.node.tryGetContext('envs')
//new CdkLearnStack(app, 'CdkLearnStackEu', { env: allEnvs })
//new CdkLearnStack(app, 'CdkLearnStackUSA', { env: allEnvs })

// ************************************************************************************

//Custom EC2
//passing env is necessary to get acc and region for AMI detection.
//new CustomEC2Stack(app, 'MyEc2',  {env : allEnvs.prod}); 

//************************************************************************************* */


//Parameter store and Secret Manager
var ssmParamAndSecretStack = new CustomParametersSecretsStack(app,"CustomSSMParamAndSecret",  {env : allEnvs.prod})


//************************************************************************************* */

//IAM Role with Policy to access above ssm parameter
var iamRole = new IamRoleWithPolicies(app,"MyBastionHostRole",  {env : allEnvs.prod})

//************************************************************************************* */


// ------------VPC + Bastion host + Autoscaling group -----------------------
//Custom VPC
var customVPC = new CustomVpcStack(app, "MyVPC",  allEnvs.prod)

//CustomBastonHost
var bastionHost = new BastionHost(app, "MyCommonBastionHost", { 
    ...allEnvs.prod,
    vpcCustom: customVPC.customVpc,
    bastionHostRole: iamRole.bastionHostRole} )

//Custom webServer
var customWebServerStack = new WebServerStack(app, "CustomWebServerId", {
    ...allEnvs.prod,
    vpcCustom: customVPC.customVpc,
    bastionHost: bastionHost.bastionHost,
    publicKeyName: bastionHost.bastionHostConnPublicKey
})

