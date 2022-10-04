import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as _s3 } from 'aws-cdk-lib';
import { aws_iam as _iam } from 'aws-cdk-lib';


export  class ResourcePolicy extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {

        super(scope,id,props)

        
        //Create S3 bucket
        var webbucket = new _s3.Bucket(this, "WebSiteBucket", {
            bucketName: "websitebucket-binay",
            versioned: true,
            publicReadAccess: true
        })

        var policyStmtAllowHtmlWithinBucket = new _iam.PolicyStatement({
            effect: _iam.Effect.ALLOW,
            actions: [ "s3:Getobject" ],
            resources: [ webbucket.arnForObjects("*.html") ], //ARN of Any object inside the bucket with the pattern            
            principals: [ new _iam.AnyPrincipal() ]
          })
          policyStmtAllowHtmlWithinBucket.sid = 'policyStmtAllowHtmlWithinBucket'

          var policyStmtDenyUnsecureAction = new _iam.PolicyStatement({
            effect: _iam.Effect.DENY,
            actions: [ "s3:Getobject" ],
            resources: [ `${webbucket.bucketArn}/*` ],      //any resource in the bucket
            principals: [ new _iam.AnyPrincipal() ],
            conditions: { 
                "Bool" : {"aws:SecureTransport" : false}  //if http instead of https
            }
          })
          policyStmtDenyUnsecureAction.sid = "policyStmtDenyUnsecureAction"

          webbucket.addToResourcePolicy(policyStmtAllowHtmlWithinBucket)
          webbucket.addToResourcePolicy(policyStmtDenyUnsecureAction)
          

    }
}