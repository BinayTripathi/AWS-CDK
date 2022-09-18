import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as _ec2 } from 'aws-cdk-lib';
import { aws_iam as _iam } from 'aws-cdk-lib';

import { VPCExportedStackProps } from '../CustomInterfaces'

import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

export class BastionHost extends Stack {

    constructor(scope: Construct, id: string, props: VPCExportedStackProps) {
      super(scope, id, props);


      const publicSubnetConfiguration: _ec2.SubnetConfiguration = {
        name: 'public',
        subnetType: _ec2.SubnetType.PUBLIC
      };

      const bastionHost = new _ec2.Instance(this, "webServerId", {
        vpc: props.vpcCustom,
        vpcSubnets:  {
            subnetType:  _ec2.SubnetType.PUBLIC,
         } ,
         //Free tier machine.
        instanceType: _ec2.InstanceType.of(_ec2.InstanceClass.T2, _ec2.InstanceSize.MICRO),
        machineImage: new _ec2.AmazonLinuxImage({
            generation: _ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            kernel: _ec2.AmazonLinuxKernel.KERNEL5_X,
            storage: _ec2.AmazonLinuxStorage.EBS
          }),
          userData: _ec2.UserData.custom(syncReadFile("install_httpd.sh")),
    })

    //Adding connection - through security group or a defaut allow type
    bastionHost.connections.allowFromAnyIpv4(_ec2.Port.tcp(2), "Allowing all SSH traffic")

    //Exporting Ip address as output
    var output1 = new CfnOutput(this, "BastionHostIp", {
        description: 'Bastion host public ip address',
        value: bastionHost.instancePublicIp,
    })

    



    function syncReadFile(filename: string) {
        const result = readFileSync(join(__dirname,'/bootstrap_scripts', filename), 'utf-8');
        return result;
      }
     
 }
}           