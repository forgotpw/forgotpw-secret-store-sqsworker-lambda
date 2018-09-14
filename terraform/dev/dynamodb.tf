resource "aws_dynamodb_table" "confirmation_code" {
  name           = "fpw_confirmation_code"
  read_capacity  = "${var.env["dynamo_confirmation_code_min_read_capacity"]}"
  write_capacity = "${var.env["dynamo_confirmation_code_min_write_capacity"]}"
  hash_key       = "NormalizedPhone"

  point_in_time_recovery {
    enabled = "false"
  }

  attribute {
    name = "NormalizedPhone"
    type = "S"
  }

  ttl {
    attribute_name = "DynamoExpireTime"
    enabled = true
  }

  lifecycle {
    ignore_changes = ["read_capacity", "write_capacity"]
  }
}

resource "aws_appautoscaling_target" "confirmation_code_dynamodb_table_read" {
  max_capacity       = "${var.env["dynamo_confirmation_code_max_read_capacity"]}"
  min_capacity       = "${var.env["dynamo_confirmation_code_min_read_capacity"]}"
  resource_id        = "table/${aws_dynamodb_table.confirmation_code.name}"
  role_arn           = "arn:aws:iam::${var.aws_account_id}:role/aws-service-role/dynamodb.application-autoscaling.amazonaws.com/AWSServiceRoleForApplicationAutoScaling_DynamoDBTable"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "confirmation_code_dynamodb_table_read_policy" {
  name               = "DynamoDBReadCapacityUtilization:${aws_appautoscaling_target.confirmation_code_dynamodb_table_read.resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = "${aws_appautoscaling_target.confirmation_code_dynamodb_table_read.resource_id}"
  scalable_dimension = "${aws_appautoscaling_target.confirmation_code_dynamodb_table_read.scalable_dimension}"
  service_namespace  = "${aws_appautoscaling_target.confirmation_code_dynamodb_table_read.service_namespace}"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }

    target_value = 70
  }
}

resource "aws_appautoscaling_target" "confirmation_code_dynamodb_table_write" {
  max_capacity       = "${var.env["dynamo_confirmation_code_max_write_capacity"]}"
  min_capacity       = "${var.env["dynamo_confirmation_code_min_write_capacity"]}"
  resource_id        = "table/${aws_dynamodb_table.confirmation_code.name}"
  role_arn           = "arn:aws:iam::${var.aws_account_id}:role/aws-service-role/dynamodb.application-autoscaling.amazonaws.com/AWSServiceRoleForApplicationAutoScaling_DynamoDBTable"
  scalable_dimension = "dynamodb:table:WriteCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "confirmation_code_dynamodb_table_write_policy" {
  name               = "DynamoDBWriteCapacityUtilization:${aws_appautoscaling_target.confirmation_code_dynamodb_table_write.resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = "${aws_appautoscaling_target.confirmation_code_dynamodb_table_write.resource_id}"
  scalable_dimension = "${aws_appautoscaling_target.confirmation_code_dynamodb_table_write.scalable_dimension}"
  service_namespace  = "${aws_appautoscaling_target.confirmation_code_dynamodb_table_write.service_namespace}"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBWriteCapacityUtilization"
    }

    target_value = 70
  }
}
