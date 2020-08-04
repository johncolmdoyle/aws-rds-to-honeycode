resource "aws_s3_bucket" "db_bucket" {
  acl           = "private"
  force_destroy = true
}
