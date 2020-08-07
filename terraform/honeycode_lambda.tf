data "archive_file" "lambda_zip" {
    type          = "zip"
    source_dir   = "${path.module}/../lambda/"
    output_path   = "${path.module}/../dist/function.zip"
}

resource "aws_lambda_function" "honeycode_lambda" {
  filename         = "${path.module}/../dist/function.zip"
  function_name    = "honeycode_lambda"
  role             = "${aws_iam_role.lambda_role.arn}"
  handler          = "index.handler"
  source_code_hash = "${data.archive_file.lambda_zip.output_base64sha256}"
  runtime          = "nodejs12.x"
  timeout          = 60
  environment {
    variables = {
      S3_BUCKET          = aws_s3_bucket.db_bucket.id 
      HONEYCODE_LOGIN    = var.honeycode_login
      HONEYCODE_PASSWORD = var.honeycode_password
      HONEYCODE_WORKBOOK = var.honeycode_workbook
      HONEYCODE_SHEET    = var.honeycode_sheet
    }
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "honeycode_lambda_role"

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

resource "aws_iam_policy" "lambda_policy" {
  name = "honeycode_lambda_policy"
  description = "Access the S3 bucket"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:*"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": "${aws_s3_bucket.db_bucket.arn}/*"
    }
  ]
} 
    EOF
  }

resource "aws_iam_role_policy_attachment" "lambda_policy_attach" {
  role       = "${aws_iam_role.lambda_role.name}"
  policy_arn = "${aws_iam_policy.lambda_policy.arn}"
}