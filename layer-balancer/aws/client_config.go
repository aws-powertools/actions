package aws

import (
	"context"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/aws/retry"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials/stscreds"
	"github.com/aws/aws-sdk-go-v2/service/sts"
)

func NewDefaultClientConfig(ctx context.Context, region string) *ClientConfig {
	clientCfg := NewClientConfig(ctx)
	clientCfg.Default(region)

	return clientCfg
}

func NewClientConfigWithRole(ctx context.Context, region string, role string) *ClientConfig {
	clientCfg := NewClientConfig(ctx)
	clientCfg.Default(region)
	clientCfg.AssumeRole(region, role)

	return clientCfg
}

func NewClientConfig(ctx context.Context) *ClientConfig {
	return &ClientConfig{
		ctx:            ctx,
		ConfigLoaderFn: config.LoadDefaultConfig,
	}
}

type ClientConfig struct {
	ctx    context.Context
	config aws.Config

	ConfigLoaderFn ConfigLoaderFn

	Region string
}

func (cc *ClientConfig) Default(region string) error {
	cc.Region = region

	config, err := cc.ConfigLoaderFn(cc.ctx, config.WithRegion(region), config.WithRetryer(func() aws.Retryer {
		retrier := retry.AddWithMaxAttempts(retry.NewStandard(), 5)
		retrier = retry.AddWithMaxBackoffDelay(retrier, time.Second*1)

		return retrier
	}))
	if err != nil {
		return err
	}

	cc.config = config

	return nil
}

func (cc *ClientConfig) AssumeRole(region string, role string) error {
	stsClient := sts.NewFromConfig(cc.config)

	newConfig, err := cc.ConfigLoaderFn(cc.ctx, config.WithRegion(region),
		config.WithRetryer(func() aws.Retryer {
			retrier := retry.AddWithMaxAttempts(retry.NewStandard(), 5)
			retrier = retry.AddWithMaxBackoffDelay(retrier, time.Second*1)

			return retrier
		}),
		config.WithCredentialsProvider(aws.NewCredentialsCache(
			stscreds.NewAssumeRoleProvider(stsClient, role),
		)),
	)

	if err != nil {
		return err
	}

	cc.config = newConfig

	return nil
}

func (cc *ClientConfig) SDKConfig() aws.Config {
	return cc.config
}

type ConfigLoaderFn func(ctx context.Context, optFns ...func(*config.LoadOptions) error) (aws.Config, error)
