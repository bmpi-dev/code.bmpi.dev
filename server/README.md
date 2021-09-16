# VSCode Server in Cloud for BMPI

## UPDATE 2021/09/17

**Now I am using the [OOTB VSCode Server](https://github.com/bmpi-dev/Out-of-the-Box-CodeServer)!**

---

This project is based on AWS to implement the function of [GitHub codespaces](https://github.com/features/codespaces), which allows you to use the power of the cloud server to use [VSCode on the browser](https://github.com/cdr/code-server) to develop at a very low cost<sup>#1</sup>, save local computer's power and bring a good development experience.

[#1]: Take AWS EC2 T2.Medium instance (2 cores 4GB memory), develop 5 hours a day, 20 days a month, 100 hours in total, the total cost is $0.0464*100=$4.64. The same configuration of Github codespaces at the same time costs $18, which is nearly **4 times** more expensive!

## How to work

```
./run work # just go to work
./run rest # just go to rest
```

That's all!

## Tech Detail

### Architecture

![](https://img.bmpi.dev/dafdc38a-8e97-7daa-d860-4ad78c4d182b.png)

### Pulumi

```
pulumi up # setup server
pulumi destroy # destroy server
```

```
pulumi stack select dev
pulumi stack output # get server public ip, instance id and public host name
```

### AWS CLI

```
aws ec2 start-instances --instance-ids `pulumi stack output ec2Id` # start ec2 server
aws ec2 stop-instances --instance-ids `pulumi stack output ec2Id` # stop ec2 server
aws ec2 describe-instance-status --instance-ids `pulumi stack output ec2Id` | jq '.InstanceStatuses[0].InstanceState.Name' # status ec2 server
aws ec2 describe-instances --instance-ids `pulumi stack output ec2Id` | jq '.Reservations[0].Instances[0].PublicIpAddress' # get ec2 server public ip
aws ssm start-session --target `pulumi stack output ec2Id` # connect ec2 server
```

### Connect to server

```
sh connect-server.sh
```

### Config vscode server

Login in server with `ubuntu` user and modify this `~/.config/code-server/config.yaml` file:

```
bind-addr: 127.0.0.1:8080 # if you want to access by server ip or domain name, then need change it to `0.0.0.0:8080`
auth: password
password: ***** # this is the vscode server password
cert: false
```

### Access vscode by SSH tunnel

Create a ssh tunnel:

```
ssh -nNT -L 8888:127.0.0.1:8080 ubuntu@`pulumi stack output ec2PublicIp`
```

Then access vscode in browser:

http://127.0.0.1:8888/

### SSM

If you want to start EC2 instance in CLI by `SSM`, you need to give inline policy to your aws user.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "ssm:GetConnectionStatus",
                "ssm:ResumeSession",
                "ssm:DescribeSessions",
                "ssm:TerminateSession",
                "ssm:StartSession"
            ],
            "Resource": "*"
        }
    ]
}
```

It also need to install [Session Manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html#install-plugin-macos)
