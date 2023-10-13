package engine

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cloudformation"
	"github.com/bitbark/util"
	"os"
)

func CreateNewStack(stackName string, accessKey string, secretKey string, region string, templateBody string) (error, string) {
	secret := os.Getenv("SECRET_CRYPT")
	textAccessKey, err := util.DecryptString(secret, accessKey)
	if err != nil {
		util.SentryException(err)
		return err, ""
	}
	textSecretKey, err := util.DecryptString(secret, secretKey)
	if err != nil {
		util.SentryException(err)
		return err, ""
	}
	credential := credentials.NewStaticCredentials(textAccessKey, textSecretKey, "")

	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(region),
		Credentials: credential,
	})

	cfSvc := cloudformation.New(sess)

	input := &cloudformation.CreateStackInput{
		StackName:    aws.String(stackName),
		TemplateBody: aws.String(templateBody),
	}

	result, err := cfSvc.CreateStack(input)
	if err != nil {
		util.SentryException(err)
		return err, ""
	}

	return nil, result.GoString()
}

func RetrieveStatusStack(stackName string, accessKey string, secretKey string, region string) (error, string) {
	secret := os.Getenv("SECRET_CRYPT")
	textAccessKey, err := util.DecryptString(secret, accessKey)
	if err != nil {
		util.SentryException(err)
		return err, ""
	}
	textSecretKey, err := util.DecryptString(secret, secretKey)
	if err != nil {
		util.SentryException(err)
		return err, ""
	}
	credential := credentials.NewStaticCredentials(textAccessKey, textSecretKey, "")

	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(region),
		Credentials: credential,
	})
	cfSvc := cloudformation.New(sess)

	input2 := &cloudformation.DescribeStacksInput{
		StackName: aws.String(stackName),
		NextToken: aws.String("NextToken"),
	}
	resp2, err := cfSvc.DescribeStacks(input2)
	if err != nil {
		util.SentryException(err)
		println(err.Error())
		return err, "ERROR"
	}

	return nil, *resp2.Stacks[0].StackStatus
}
