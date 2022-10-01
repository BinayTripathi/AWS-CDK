import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { aws_ec2 as _ec2, aws_iam as _iam } from 'aws-cdk-lib';


import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


export interface VPCExportedStackProps extends StackProps { vpcCustom: _ec2.Vpc, bastionHostRole:  _iam.Role}
export interface WebServerStackProps extends VPCExportedStackProps { publicKeyName: string, bastionHost: _ec2.Instance }

export function syncReadFile(filename: string) {
    const result = readFileSync(join(__dirname,'/CustomEC2/bootstrap_scripts', filename), 'utf-8');
    return result;
  }


  export const freeTierInstanceType = _ec2.InstanceType.of(_ec2.InstanceClass.T2, _ec2.InstanceSize.MICRO);
  export const freeTierMmachineImage = new _ec2.AmazonLinuxImage({
      generation: _ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      kernel: _ec2.AmazonLinuxKernel.KERNEL5_X,
      storage: _ec2.AmazonLinuxStorage.EBS
    });


  export  const publicSubnetConfiguration: _ec2.SubnetConfiguration = {
        name: 'public',
        subnetType: _ec2.SubnetType.PUBLIC
      };


  export  const privateSubnetWithNATConfiguration: _ec2.SubnetConfiguration = {
        name: 'private',
        subnetType: _ec2.SubnetType.PRIVATE_WITH_NAT
      };      
  
