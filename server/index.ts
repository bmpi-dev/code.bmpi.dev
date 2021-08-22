import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { InstanceType } from "@pulumi/aws/types/enums/ec2";
import { readFileSync } from 'fs';

const serverName = 'bmpi-code';

// EC2 Key Pair

const kpData = readFileSync(require('os').homedir() + '/.ssh/id_rsa.pub', 'utf-8');

const kp = new aws.ec2.KeyPair(serverName + "-kp", {
    publicKey: kpData,
});

// OS Config

const ec2ImageId = 'ami-0cb5f8e033cfa84d2'; // us-east-1, Ubuntu 20.04,	AMD64, https://cloud-images.ubuntu.com/locator/
const ec2ImageOwner = '099720109477';
const ec2InstanceName = serverName;

const pulumiAmi = pulumi.output(aws.ec2.getAmi({
    filters: [{ name: "image-id", values: [ec2ImageId]}],
    owners: [ec2ImageOwner]
}));

// VPC Config

const sshPort = 22
const nginxHttpPort = 80
const nginxHttpsPort = 443
const codeServerPort = 8080

const pulumiSecurityGroup = new aws.ec2.SecurityGroup(serverName + "-pulumi-secgrp", {
        ingress: [{
            fromPort: sshPort,
            toPort: sshPort,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"]
        }, {
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["172.31.0.0/16"]
        }, {
            fromPort: nginxHttpPort,
            toPort: nginxHttpPort,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"]
        }, {
            fromPort: nginxHttpsPort,
            toPort: nginxHttpsPort,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"]
        }, {
            fromPort: codeServerPort,
            toPort: codeServerPort,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"]
        }],
        egress: [{
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"]
        }]
    },
);

// SSM Profile (Connect to instance by AWS SSM)

const ssmRole = new aws.iam.Role(serverName + "-SSMRole", {
    assumeRolePolicy: `{
        "Version": "2012-10-17",
        "Statement": [
            {
            "Effect": "Allow",
            "Principal": {"Service": "ec2.amazonaws.com"},
            "Action": "sts:AssumeRole"
            }
        ]
    }`
});
  
  new aws.iam.RolePolicyAttachment(serverName + "-SSMAttach", {
    policyArn: "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
    role: ssmRole.name,
  });
  
  const ssmProfile = new aws.iam.InstanceProfile(serverName + "-SSMProfile", {
    name: serverName + "-SSMProfile",
    role: ssmRole,
  })

// EC2 Config

const diskSize = 50; // EC2 root disk default size is 50GB

const userData = readFileSync('scripts/cloud_devops_tools.sh', 'utf-8');

let ec2Instance = new aws.ec2.Instance(
    ec2InstanceName,
    {
        instanceType: InstanceType.T2_Medium,
        ami: pulumiAmi.id,
        keyName: kp.keyName,
        vpcSecurityGroupIds: [pulumiSecurityGroup.id],
        rootBlockDevice: {
            deleteOnTermination: true,
            volumeSize: diskSize,
            encrypted: true,
        },
        hibernation: true,
        iamInstanceProfile: ssmProfile,
        userData: userData,
    }
)

// Outputs

exports.ec2Id = ec2Instance.id;
exports.ec2PublicIp = ec2Instance.publicIp;
exports.ec2PublicHostName = ec2Instance.publicDns;
