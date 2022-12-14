import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_iam as _iam } from 'aws-cdk-lib';
import { Aws } from '@aws-cdk/core';


export class IamRoleWithPolicies extends Stack {

    bastionHostRole: _iam.Role;
    
    constructor(scope: Construct, id: string, props: StackProps) {

        super(scope,id,props)
        
        //Policy statement can be used to create inline policy or can be added to Customer Managed Policy
        const paramStoreReadOnlyPolicyStmt = new _iam.PolicyStatement({
            effect: _iam.Effect.ALLOW,
            resources: [
              `arn:aws:ssm:${Aws.REGION}:${Aws.ACCOUNT_ID}:parameter/app/myApplication_dev/NoOfConcurrentUsers`,
              //`arn:aws:ssm:${props.env?.region}:${props.env?.account}:parameter/app/myApplication_dev/NoOfConcurrentUsers`
              `arn:aws:ssm:${Aws.REGION}:${Aws.ACCOUNT_ID}:parameter/ec2/keypair/key-*`
            ],
            actions: [
              "ssm:DescribeParameters", "ssm:GetParameters", "ssm:GetParameter", "ssm:GetParameterHistory"
            ]
          })
          paramStoreReadOnlyPolicyStmt.sid = "ReadOnlyAccessToSSMParamNoOfConcurrentUser"

          const kmsReadOnlyPolicyStmt = new _iam.PolicyStatement({
            effect: _iam.Effect.ALLOW,
            resources: [
              "arn:aws:kms:ap-southeast-2:500418659403:key/49cf846f-3008-4e57-976c-0ac555128e1a"
            ],
            actions: [
              "kms:Decrypt", "kms:DescribeKey"
            ]
          })
          kmsReadOnlyPolicyStmt.sid = "ReadOnlyAccessToKMS"

        // CustomerManaged policy type. If we just give _iam.Policy it creates inline policy
        const paramStoreReadOnlyPolicy = new _iam.ManagedPolicy(this, "ParamStoreReadOnlyAccess", {
            statements: [paramStoreReadOnlyPolicyStmt]
        })

        // AWS Managed Policy
        const s3ReadOnlyPolicy = _iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess");

        //Create role
         this.bastionHostRole = new _iam.Role(this, "MyBastionHostRole", {
          roleName: "MyBastionHostRole",
          assumedBy: new _iam.ServicePrincipal("ec2.amazonaws.com")
        })

        //Attach policies to role
        this.bastionHostRole.addManagedPolicy(s3ReadOnlyPolicy)   // AWS Managed
        this.bastionHostRole.addManagedPolicy(paramStoreReadOnlyPolicy) // Customer Managed
        this.bastionHostRole.addToPolicy(kmsReadOnlyPolicyStmt)  //Inline
    }

}
