import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as _ec2 } from 'aws-cdk-lib';
import { aws_iam as _iam } from 'aws-cdk-lib';
import { aws_elasticloadbalancingv2 as _elb } from 'aws-cdk-lib';
import { aws_autoscaling as _autoscaling} from 'aws-cdk-lib';

import { VPCExportedStackProps } from '../CustomInterfaces'

import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


export class WebServerStack extends Stack {

    constructor(scope: Construct, id: string,  props: VPCExportedStackProps) {
      super(scope, id, props);

     
        //Create Load balancer
        const alb = new _elb.ApplicationLoadBalancer(this, "myAlbId", {
          vpc: props.vpcCustom,
          internetFacing: true,
          loadBalancerName: "WebserverALB"
        })

        //Allow ALB to receive HTTP traffic from internet
        alb.connections.allowFromAnyIpv4(_ec2.Port.tcp(80), "Allowing internet access on ALB Port80")

        //Add Listener to ALB
        const listner = alb.addListener("wsListenerId", {
          port: 80,
          open: true
        })
     
        
       //--- START Resources to creating Autoscaling group
        const instanceType = _ec2.InstanceType.of(_ec2.InstanceClass.T2, _ec2.InstanceSize.MICRO);
        const machineImage = new _ec2.AmazonLinuxImage({
            generation: _ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            kernel: _ec2.AmazonLinuxKernel.KERNEL5_X,
            storage: _ec2.AmazonLinuxStorage.EBS
          });

          
      //Webserver IAM role (Service based)
      var weServerRole = new _iam.Role(this,"WebServerRoleId", {
        assumedBy: new _iam.ServicePrincipal('ec2.amazonaws.com'),
        managedPolicies : [
          _iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
          _iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')
        ]
      })

      

      const privateSubnetWithNATConfiguration: _ec2.SubnetConfiguration = {
        name: 'private',
        subnetType: _ec2.SubnetType.PRIVATE_WITH_NAT
      };

      function syncReadFile(filename: string) {
        const result = readFileSync(join(__dirname,'/bootstrap_scripts', filename), 'utf-8');
        return result;
      }

      //This will create a new SSH key and upload the private key to SSM
      //https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-ec2.CfnKeyPair.html
      const cfnKeyPair = new _ec2.CfnKeyPair(this, 'WebServerKeyPair', {
        keyName: 'WebServerBastionConnTest',
      })
      
       //--- END Resources to creating Autoscaling group

       //Creating Autoscaling group
      var webServerAutoscalingGroup = new _autoscaling.AutoScalingGroup(this,"WebServerASGId", {
        vpc: props.vpcCustom,
        vpcSubnets: privateSubnetWithNATConfiguration, //IF its private isolated, httpd installation fails
        instanceType: instanceType,
        machineImage: machineImage,
        role: weServerRole,
        minCapacity: 2,
        maxCapacity: 2,
        userData:_ec2.UserData.custom(syncReadFile("install_httpd.sh")),
        keyName: 'WebServerBastionConnTest'
      })


      //Allow ASG Security group to receive traffic from ALB
      //Ingress
      webServerAutoscalingGroup.connections.allowFrom(alb,  _ec2.Port.tcp(80), 
      "Allow ASG Security group to receive traffic from ALB")

      //Egress
      webServerAutoscalingGroup.connections.allowTo(alb,  _ec2.Port.tcp(80), 
      "Allow ASG Security group to receive traffic to ALB")

    //Adding autoscaling group to ALB target group
      listner.addTargets("listenedID", {
        port : 80, // 443 if we add certificate
        targets : [webServerAutoscalingGroup]
      })
     
      //Output of ALB domain name
      var outputAlb1 = new CfnOutput(this, "AlbDomainName", {
        description: 'Webservers ALB domain name',
        value: `http://${alb.loadBalancerDnsName}`,
    })

    var bastionJost = new _ec2.Instance(this,"BastionHostWrbServer", {
      instanceType: instanceType,
      machineImage: machineImage,
      vpc: props.vpcCustom,
      vpcSubnets: publicSubnetConfiguration,
      userData:_ec2.UserData.custom(syncReadFile("install_httpd.sh")),
      keyName: 'Binay_Sydney_BastionHost'
    })

    bastionJost.connections.allowFromAnyIpv4(_ec2.Port.tcp(22), "Allow SSH to bastion hoste")
    webServerAutoscalingGroup.connections.allowFrom(bastionJost,  _ec2.Port.tcp(22), 
      "Allow SSH from bastion host to Autoscaling group")
   }
}           