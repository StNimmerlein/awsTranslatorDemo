#!/bin/bash

TEMPLATE_ENV_LOCATION='../frontend/src/environments/environment.prod.template.ts'
PROD_ENV_LOCATION='../frontend/src/environments/environment.prod.ts';

apiUrl=$(aws cloudformation describe-stacks --stack-name InfrastructureStack --query "Stacks[0].Outputs[?OutputKey=='ApiOutput'].OutputValue" --output text)

cat ${TEMPLATE_ENV_LOCATION} | sed "s;%API_URL%;${apiUrl};g" > ${PROD_ENV_LOCATION}
