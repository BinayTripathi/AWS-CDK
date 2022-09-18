import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as _ec2 } from 'aws-cdk-lib';

export class CustomVpcStack extends Stack {

  customVpc: _ec2.Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
 

      var envMy =  this.node.tryGetContext('envs')
      const vpcConf = envMy.prod.vpc_configs
      console.log(vpcConf)

      const publicSubnetConfiguration: _ec2.SubnetConfiguration = {
        name: 'public',
        subnetType: _ec2.SubnetType.PUBLIC,
        cidrMask: vpcConf.cidr_mask
      };

      const privateSubnetConfiguration: _ec2.SubnetConfiguration = {
        name: 'private',
        subnetType: _ec2.SubnetType.PRIVATE_ISOLATED,
        cidrMask: vpcConf.cidr_mask
      };

      const privateWithNatSubnetConfiguration: _ec2.SubnetConfiguration = {
        name: 'privateWithNat',
        subnetType: _ec2.SubnetType.PRIVATE_WITH_NAT,
        cidrMask: vpcConf.cidr_mask
      };

          this.customVpc = new _ec2.Vpc(this, "CustomVpc", {
          cidr: vpcConf.cidr,
          maxAzs: 2,
          natGateways: 1,
          subnetConfiguration: [
            publicSubnetConfiguration, privateSubnetConfiguration, privateWithNatSubnetConfiguration
          ]
        } )

        Tags.of(this.customVpc).add("Owner", "Binay")

        var vcpCfnOutput = new CfnOutput(this, "customVpcIdO", 
                    {value: this.customVpc.vpcId, exportName: "customVpcOutput"})
    }
  }

  

