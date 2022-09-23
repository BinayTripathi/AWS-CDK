import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as _ec2 } from 'aws-cdk-lib';
import { aws_iam as _iam } from 'aws-cdk-lib';
import { aws_elasticloadbalancingv2 as _elb } from 'aws-cdk-lib';
import { aws_autoscaling as _autoscaling} from 'aws-cdk-lib';

import { WebServerStackProps,syncReadFile, freeTierInstanceType, freeTierMmachineImage, privateSubnetWithNATConfiguration } from '../CustomInterfaces'

export class WebServerStack extends Stack {

    constructor(scope: Construct, id: string,  props: WebServerStackProps) {
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
          
      //Webserver IAM role (Service based)
      var weServerRole = new _iam.Role(this,"WebServerRoleId", {
        assumedBy: new _iam.ServicePrincipal('ec2.amazonaws.com'),
        managedPolicies : [
          _iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
          _iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')
        ]
      })
       
      //--- END Resources to creating Autoscaling group

       //Creating Autoscaling group
      var webServerAutoscalingGroup = new _autoscaling.AutoScalingGroup(this,"WebServerASGId", {
        vpc: props.vpcCustom,
        vpcSubnets: privateSubnetWithNATConfiguration, //IF its private isolated, httpd installation fails
        instanceType: freeTierInstanceType,
        machineImage: freeTierMmachineImage,
        role: weServerRole,
        minCapacity: 2,
        maxCapacity: 2,
        userData:_ec2.UserData.custom(syncReadFile("install_httpd.sh")),
        keyName: props.publicKeyName
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

    webServerAutoscalingGroup.connections.allowFrom(props.bastionHost,  _ec2.Port.tcp(22), 
      "Allow SSH from bastion host to Autoscaling group")
   }
}           