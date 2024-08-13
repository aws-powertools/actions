package aws_test

import (
	"context"
	"errors"
	"testing"

	"github.com/aws-powertools/actions/layer-balancer/aws"

	awsSDK "github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
)

func TestNewClientConfig(t *testing.T) {
	t.Run("NewClientConfig", func(t *testing.T) {
		cfg := aws.NewClientConfig(context.TODO())
		if cfg == nil {
			t.Error("Unable to create new client config")
		}

		if cfg.ConfigLoaderFn == nil {
			t.Error("ConfigLoaderFn is nil")
		}
	})
}

func TestDefault(t *testing.T) {

	loaderOkFn := func(ctx context.Context, optFns ...func(*awsConfig.LoadOptions) error) (awsSDK.Config, error) {
		return awsSDK.Config{}, nil
	}

	loaderErrFn := func(ctx context.Context, optFns ...func(*awsConfig.LoadOptions) error) (awsSDK.Config, error) {
		return awsSDK.Config{}, errors.New("Some error")
	}

	t.Run("Default no error", func(t *testing.T) {
		cfg := aws.NewClientConfig(context.TODO())
		cfg.ConfigLoaderFn = loaderOkFn
		if err := cfg.Default("us-east-1"); err != nil {
			t.Error("There was an issue loading the default config")
		}
	})

	t.Run("Default some error", func(t *testing.T) {
		cfg := aws.NewClientConfig(context.TODO())
		cfg.ConfigLoaderFn = loaderErrFn
		if err := cfg.Default("us-east-1"); err == nil {
			t.Error("There was no issue loading the default config")
		}
	})
}
