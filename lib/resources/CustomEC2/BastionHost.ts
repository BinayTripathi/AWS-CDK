import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as _ec2 } from 'aws-cdk-lib';
import { aws_iam as _iam } from 'aws-cdk-lib';

import { VPCExportedStackProps, syncReadFile, freeTierInstanceType, freeTierMmachineImage, publicSubnetConfiguration } from '../CustomInterfaces'


export class BastionHost extends Stack {

  bastionHostConnPublicKey: String
  bastionHost : _ec2.BastionHostLinux | _ec2.Instance

    constructor(scope: Construct, id: string, props: VPCExportedStackProps) {
      super(scope, id, props);

      

      //This will create a new SSH key and upload the private key to SSM
      //https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-ec2.CfnKeyPair.html
      const cfnKeyPair = new _ec2.CfnKeyPair(this, 'WebServerKeyPair', {
        keyName: 'WebServerBastionHostConnKey',
      })

      this.bastionHostConnPublicKey = cfnKeyPair.keyName;

      //Bastion host as provided by cdk it has SSM 
      /*this.bastionHost = new _ec2.BastionHostLinux(this, 'BastionHost', {
        vpc: props.vpcCustom,
        subnetSelection: publicSubnetConfiguration,
        instanceType : freeTierInstanceType,
        machineImage: freeTierMmachineImage,

      });*/
      
        /*this.bastionHost = new _ec2.Instance(this,"BastionHost", {
        instanceType: freeTierInstanceType,
        machineImage: freeTierMmachineImage,
        vpc: props.vpcCustom,
        vpcSubnets: publicSubnetConfiguration,
        userData:_ec2.UserData.custom(syncReadFile("install_httpd.sh")),
        keyName: 'Binay_Sydney_BastionHost'
      })
      
       //Adding connection - through security group or a defaut allow type
      this.bastionHost.connections.allowFromAnyIpv4(_ec2.Port.tcp(22), "Allowing all SSH traffic")*/

   

    //Exporting Ip address as output
    var output1 = new CfnOutput(this, "BastionHostIp", {
        description: 'Bastion host public ip address',
        value: this.bastionHost.instancePublicIp,
    })

 }
}           