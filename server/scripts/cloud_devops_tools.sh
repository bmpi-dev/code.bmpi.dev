#!/bin/bash
set -ex

# Disable pointless daemons
# systemctl stop snapd snapd.socket lxcfs snap.amazon-ssm-agent.amazon-ssm-agent
# systemctl disable snapd snapd.socket lxcfs snap.amazon-ssm-agent.amazon-ssm-agent
printf "==> Installing utilities and CLIs: git, awscli, curl, jq, unzip, software-properties-common (apt-add-repository) and sudo \n"
apt update
DEBIAN_FRONTEND=noninteractive apt install -y git awscli curl jq unzip software-properties-common sudo apt-transport-https
printf "==> Installing docker.io \n"
DEBIAN_FRONTEND=noninteractive apt install -y docker.io
apt-mark hold docker.io
# Point Docker at big ephemeral drive and turn on log rotation
systemctl stop docker
mkdir /mnt/docker
chmod 711 /mnt/docker
cat <<EOF > /etc/docker/daemon.json
{
    "data-root": "/mnt/docker",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "5"
    }
}
EOF
systemctl start docker
systemctl enable docker
# Pass bridged IPv4 traffic to iptables chains
service procps start
printf "==> Installing Code-Server \n"
cd /tmp/
wget -q https://code-server.dev/install.sh
chmod +x install.sh
HOME=/home/ubuntu ./install.sh # setup for `ubuntu` user
printf "==> Running Code-Server as systemd service for the user '$USER' \n"
sudo systemctl enable --now code-server@ubuntu # setup for `ubuntu` user
printf "==> Installing VS Code Extension: Shan.code-settings-sync. \n"
code-server --install-extension Shan.code-settings-sync
printf "==> Get a trusted Gist ID to restore extensions and configurations through Settings-Sync Extension:\n"
printf "==> You can use this: https://gist.github.com/madawei2699/60600a4119185bc72f7ab928927150ed \n\n"
printf "==> Restarting Code-Server to apply changes. \n"
sudo systemctl restart code-server@ubuntu # setup for `ubuntu` user

printf "==> Installing DevOps Tooling (Terraform, Packer, AWS CLI, Java and Maven). \n"
# Download the script only so you can run it whenever you want.
wget -qN https://raw.githubusercontent.com/bmpi-dev/how-tos/main/src/devops_tools_install_v3.sh
chmod +x devops_tools_install_v3.sh
mv devops_tools_install_v3.sh /home/ubuntu/
#. devops_tools_install_v3.sh --arch=amd

printf "==> Installation of Cloud DevOps Tooling successfully !! <== \n"