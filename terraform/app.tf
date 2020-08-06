data "archive_file" "app_zip" {
    type          = "zip"
    source_dir   = "${path.module}/../app/"
    output_path   = "${path.module}/../dist/app.zip"
}

resource "aws_lambda_function" "app_lambda" {
  filename         = "${path.module}/../dist/app.zip"
  function_name    = "app_lambda"
  role             = "${aws_iam_role.app_lambda_role.arn}"
  handler          = "index.get"
  source_code_hash = "${data.archive_file.app_zip.output_base64sha256}"
  runtime          = "nodejs12.x"
  timeout          = 60
  environment {
    variables = {
      DB_USERNAME      = module.aurora.this_rds_cluster_master_username
      DB_PASSWORD      = module.aurora.this_rds_cluster_master_password
      DB_HOSTNAME      = module.aurora.this_rds_cluster_endpoint
      DB_DATABASE_NAME = "postgres"
    }
  }
}

resource "aws_iam_role" "app_lambda_role" {
  name = "app_lambda_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
