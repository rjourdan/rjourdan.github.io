import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class CodeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const homeSubnet = "10.0.1.0/24" // your home subnet
    const homePublicIP = "69.149.123.165" // the public IP address given by your ISP to the router

    const vpc = new ec2.Vpc(this, "Test_S2SVPN_VPC", {
      cidr: "10.155.0.0/16", // The global subnet for the VPC
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24, // the system will carve out from the global subnet a /24
          name: 'myPrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE, //create a private subnet
        },
        {
        cidrMask: 24,
        name: 'myPublicSubnet',
        subnetType: ec2.SubnetType.PUBLIC, //create a public subnet with an IGW and a NAT GW
      }
      ],
      vpnGateway: true, //we want to create a VPN gateway
      vpnConnections: {
        homeVPN: { 
          ip : homePublicIP,
          staticRoutes: [ //this is where we redistribute our home network routes into the private subnet's route table
            homeSubnet
          ]
        } 
      }
    });
  }
}
