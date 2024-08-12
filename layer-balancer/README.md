# Balance

The `balance` tool allows the user to copy an AWS Lambda Layer from one AWS region to another, it is designed to be as generic as possible.

## Usage

```
usage: balance [options] 

flags:
  -dry-run
        explicitly set to false to perform operation (default true)
  -layer-name string
        layer name to copy to another region
  -read-region string
        known good region with a complete layer history
  -write-region string
        region the new layer will exist in, this doesn't have to be the same account
  -write-role string
        role ARN for write operation, it has to be assumable by your environment role
```

By default, the `balance` tool operates in dry run mode, this is advised before any copy operation to validate the tool is copying what is expected. The tool also expects to have a seperate IAM role to assume to perform write operations, this enables cross account copies as well as allowing for elevated privileges when operating from a read-only role.

## IAM Permissions Required

The tool requires very few IAM actions to operate, in dry run mode, it only requires two permissions:
- ListLayerVersions
- GetLayerVersionByArn

Write requires two more:
- PublishLayerVersion
- AddLayerVersionPermission

### Example read role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:ListLayerVersions",
        "lambda:GetLayerVersionByArn"
      ],
      "Resource": "*",
      "Principal": {
        "AWS": [
          "arn:aws:iam::${Account}:role/${RoleName}"
        ]
      },
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": [
            "${Region}"
          ]
        }
      }
    }
  ]
}
```

### Example write role

#### Body

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:AddLayerVersionPermission",
        "lambda:PublishLayerVersion"
      ],
      "Resource": "*",
      "Principal": {
        "AWS": [
          "arn:aws:iam::${Account}:role/${RoleName}"
        ]
      },
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": [
            "${Region}"
          ]
        }
      }
    }
  ]
}
```

#### Trust policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${Account}:role/${ReadRoleName}"
            },
            "Action": "sts:AssumeRole",
            "Condition": {}
        }
    ]
}
```