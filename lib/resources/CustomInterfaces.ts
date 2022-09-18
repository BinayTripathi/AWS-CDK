import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { aws_ec2 as _ec2 } from 'aws-cdk-lib';


export interface VPCExportedStackProps extends StackProps { vpcCustom: _ec2.Vpc }