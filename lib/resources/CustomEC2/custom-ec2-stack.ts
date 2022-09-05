import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as _ec2 } from 'aws-cdk-lib';

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
          })
    })

     
}
}           