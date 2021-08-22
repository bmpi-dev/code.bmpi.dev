ssh ubuntu@`pulumi stack output ec2PublicIp`
# aws ssm start-session --target `pulumi stack output ec2Id`
