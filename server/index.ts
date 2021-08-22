import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { InstanceType } from "@pulumi/aws/types/enums/ec2";
import { readFileSync } from 'fs';

const ec2KeypairName = 'bmpi-code-server'; // !create a key pair(or using a exist) with this name in aws web console first!

// OS Config

const ec2ImageId = 'ami-0cb5f8e033cfa84d2'; // us-east-1, Ubuntu 20.04 LTS,	AMD64, https://cloud-images.ubuntu.com/locator/ec2/
const ec2ImageOwner = '099720109477';
const ec2InstanceName = "bmpi-code-server";

const pulumiAmi = pulumi.output(aws.ec2.getAmi({
    filters: [{ name: "image-id", values: [ec2ImageId]}],
    owners: [ec2ImageOwner]
}));

// VPC Config

const sshPort = 22
const nginxHttpPort = 80
const nginxHttpsPort = 443
const codeServerPort = 8080

const pulumiSecurityGroup = new aws.ec2.SecurityGroup("pulumi-secgrp-bmpi-code", {
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

// EC2 Config

const userData = readFileSync('scripts/cloud_devops_tools.sh', 'utf-8');

let ec2Instance = new aws.ec2.Instance(
    ec2InstanceName,
    {
        instanceType: InstanceType.T2_Medium,
        ami: pulumiAmi.id,
        keyName: ec2KeypairName,
        vpcSecurityGroupIds: [pulumiSecurityGroup.id],
        rootBlockDevice: {
            deleteOnTermination: false,
            volumeSize: 20,
            encrypted: true,
        },
        hibernation: true,
        userData: userData,
    }
)

// Outputs

exports.ec2Id = ec2Instance.id;
exports.ec2PublicIp = ec2Instance.publicIp;
exports.ec2PublicHostName = ec2Instance.publicDns;
