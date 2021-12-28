#!/bin/bash
source /home/ec2-user/.bashrc

if [ "$DEPLOYMENT_GROUP_NAME" == "devCrsEngV2DepGrp" ]
then
    cd /home/ec2-user/DBChangeDev/CourseEnginever2
    pm2 delete "CrsEngV2DevAPI"
    pm2 start index.js --name "CrsEngV2DevAPI"
    echo 'dev started successfully'
else
    cd /home/ec2-user/DBChangeDev/CourseEnginever2
    pm2 delete "CrsEngV2DevAPI"
    pm2 start index.js --name "CrsEngV2DevAPI"
    echo 'demo started successfully'
fi
