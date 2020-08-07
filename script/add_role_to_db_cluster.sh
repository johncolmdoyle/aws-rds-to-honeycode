#!/bin/bash
AWS_ACCOUNT_ID=`aws sts get-caller-identity --query 'Account' | tr -d '"'`;

aws rds add-role-to-db-cluster    \
  --db-cluster-identifier aurora-example    \
  --feature-name s3Export    \
  --role-arn arn:aws:iam::${AWS_ACCOUNT_ID}:role/test_role    \
  --region us-east-1;
