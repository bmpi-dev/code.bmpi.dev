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
