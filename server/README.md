## Pulumi

```
pulumi up # setup server
pulumi destroy # destroy server
```

```
pulumi stack select dev
pulumi stack output # get server public ip, instance id and public host name
```

## Connect to server

```
sh connect-server.sh
```

## Config vscode server

Login in server with `ubuntu` user and modify this `~/.config/code-server/config.yaml` file:

```
bind-addr: 127.0.0.1:8080 # if you want to access by server ip or domain name, then need change it to `0.0.0.0:8080`
auth: password
password: ***** # this is the vscode server password
cert: false
```

## Access vscode by SSH tunnel

Create a ssh tunnel:

```
ssh -nNT -L 8888:localhost:8080 ubuntu@`pulumi stack output ec2PublicIp`
```

Then access vscode in browser:

http://localhost:8888/

## SSM

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
