      _              ____  
     | |            / __ \ 
   __| |_   _ _ __ | |  | |
  / _` | | | | '_ \| |  | |
 | (_| | |_| | | | | |__| |
  \__,_|\__, |_| |_|\____/ 
         __/ |             
        |___/              

This serverless projects can change the origin for behaviours on your CDN

Project documentation: 

This code use Lambda@Edge functions in order to intercept and manipulate the requests that travel through our cloudfront distributions
![diagram](https://cdn-images-1.medium.com/max/1600/1*2X3D7IbxfKIiwWUd6u9nDw.png)


This allow us to:

- Change the response in order to return pre-rendered pages from the same or different origin for crawlers and bots

- Split traffic to different origins based on specific condition as the user location 

- Perform A/B testing before the behavior routing decisions that consistently flag the versions for multiple applications at the same time

## Stack
* SAM
* nodejs12.x

## Prerequisites
* nodejs
* aws cli
* sam

## Run
1. Build
```
sam build
```

2. Deploy
```
# edge-dynamic-origin-dev is the env name
sam deploy --region $REGION --s3-bucket $S3_BUCKET --s3-prefix $ENV_NAME --stack-name $PROJECT_NAME-$ENV_NAME --capabilities CAPABILITY_IAM --parameter-overrides ParameterKey=Stage,ParameterValue=$ENV_NAME ParameterKey=ProjectName,ParameterValue=$PROJECT_NAME --no-confirm-changeset
```

## CI
The folder .ci contains all the files to automatically deploy and configure the cloudfront distributions
Here you can read more about this process:
