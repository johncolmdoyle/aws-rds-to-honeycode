resource "aws_api_gateway_rest_api" "example" {
  name = "example_api"
}

resource "aws_api_gateway_resource" "example" {
  rest_api_id = "${aws_api_gateway_rest_api.example.id}"
  parent_id   = "${aws_api_gateway_rest_api.example.root_resource_id}"
  path_part   = "honeycode-sync"
}

resource "aws_api_gateway_method" "example" {
  rest_api_id   = "${aws_api_gateway_rest_api.example.id}"
  resource_id   = "${aws_api_gateway_resource.example.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "example" {
  rest_api_id = "${aws_api_gateway_rest_api.example.id}"
  resource_id = "${aws_api_gateway_resource.example.id}"
  http_method = "${aws_api_gateway_method.example.http_method}"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.app_lambda.invoke_arn}"
  integration_http_method = "POST"
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "app_lambda"
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.ama`zon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.example.id}/*/*${aws_api_gateway_resource.example.path}"
}

resource "aws_api_gateway_deployment" "example" {
  depends_on = ["aws_api_gateway_integration.example"]

  rest_api_id = "${aws_api_gateway_rest_api.example.id}"
  stage_name  = "api"
}
