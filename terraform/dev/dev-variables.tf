variable "env" {
  default = {
    # dynamodb autoscaling
    dynamo_confirmation_code_min_read_capacity  = 1
    dynamo_confirmation_code_max_read_capacity  = 20
    dynamo_confirmation_code_min_write_capacity = 1
    dynamo_confirmation_code_max_write_capacity = 20
  }
}
