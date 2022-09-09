import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as _ec2 } from 'aws-cdk-lib';
import { aws_iam as _iam } from 'aws-cdk-lib';

import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

export class CustomEC2Stack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);

       // 👇 import VPC by Name
       const myVpc = _ec2.Vpc.fromLookup(this, 'external-vpc', {
        vpcId: 'vpc-a7cc36c1',
      });
      console.log('vpcId ', myVpc.vpcId);
      console.log('vpcCidrBlock ', myVpc.vpcCidrBlock);



      const web_server = new _ec2.Instance(this, "webServerId", {
        vpc: myVpc,
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
    web_server.connections.allowFromAnyIpv4(_ec2.Port.tcp(80), "Allowing all web traffic on TCP")

    //Add permissions to webserver instance profile to login without ssh or push logs
    web_server.role.addManagedPolicy(
      _iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    )

    //Add permissions to webserver to access S3
    web_server.role.addManagedPolicy(
      _iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess")
    )

    //Exporting Ip address as output
    var output1 = new CfnOutput(this, "WebServerIp", {
        description: 'Webservers public ip address',
        value: `http://${web_server.instancePublicIp}`,
    })

    



    function syncReadFile(filename: string) {
        const result = readFileSync(join(__dirname,'/bootstrap_scripts', filename), 'utf-8');
        return result;
      }
     
 }
}           