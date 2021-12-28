#!/bin/bash
source /home/ec2-user/.bashrc

if [ "$DEPLOYMENT_GROUP_NAME" == "devCrsEngV2DepGrp" ]
then
   cd /home/ec2-user/DBChangeDev/CourseEngAPI
   cp -avr /home/ec2-user/test/shellscripts/deployapistaging/crsengv2/dev-aps1/.env /home/ec2-user/DBChangeDev/CourseEnginever2/   
   echo 'dev started successfully'

else
   cd /home/ec2-user/DBChangeDev/CourseEngAPI
   cp -avr /home/ec2-user/test/shellscripts/deployapistaging/crsengv2/dev-aps1/.env /home/ec2-user/DBChangeDev/CourseEnginever2/
   echo 'prod started successfully'
fi

npm install

npm audit fix
