#!/bin/sh

# Option 1
ec2Id=`pulumi stack output ec2Id`
ec2IP=`aws ec2 describe-instances --instance-ids ${ec2Id} | jq '.Reservations[0].Instances[0].PublicIpAddress' | tr -d '"'`
ssh -i ~/.ssh/id_rsa ubuntu@${ec2IP}
# Option 2
# aws ssm start-session --target `pulumi stack output ec2Id`
