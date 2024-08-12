package layers_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
	"strings"
	"testing"

	"github.com/aws-powertools/powertools-lambda-layers/layers"
	awsSDK "github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/aws/aws-sdk-go-v2/service/lambda/types"
	"github.com/aws/smithy-go"
)

type FakeClient struct {
	ListLayerVersionsFn         func(ctx context.Context, params *lambda.ListLayerVersionsInput, optFns ...func(*lambda.Options)) (*lambda.ListLayerVersionsOutput, error)
	GetLayerVersionByArnFn      func(ctx context.Context, params *lambda.GetLayerVersionByArnInput, optFns ...func(*lambda.Options)) (*lambda.GetLayerVersionByArnOutput, error)
	PublishLayerVersionFn       func(ctx context.Context, params *lambda.PublishLayerVersionInput, optFns ...func(*lambda.Options)) (*lambda.PublishLayerVersionOutput, error)
	AddLayerVersionPermissionFn func(ctx context.Context, params *lambda.AddLayerVersionPermissionInput, optFns ...func(*lambda.Options)) (*lambda.AddLayerVersionPermissionOutput, error)
}

func (c *FakeClient) ListLayerVersions(ctx context.Context, params *lambda.ListLayerVersionsInput, optFns ...func(*lambda.Options)) (*lambda.ListLayerVersionsOutput, error) {
	return c.ListLayerVersionsFn(ctx, params, optFns...)
}

func (c *FakeClient) GetLayerVersionByArn(ctx context.Context, params *lambda.GetLayerVersionByArnInput, optFns ...func(*lambda.Options)) (*lambda.GetLayerVersionByArnOutput, error) {
	return c.GetLayerVersionByArnFn(ctx, params, optFns...)
}

func (c *FakeClient) PublishLayerVersion(ctx context.Context, params *lambda.PublishLayerVersionInput, optFns ...func(*lambda.Options)) (*lambda.PublishLayerVersionOutput, error) {
	return c.PublishLayerVersionFn(ctx, params, optFns...)
}

func (c *FakeClient) AddLayerVersionPermission(ctx context.Context, params *lambda.AddLayerVersionPermissionInput, optFns ...func(*lambda.Options)) (*lambda.AddLayerVersionPermissionOutput, error) {
	return c.AddLayerVersionPermissionFn(ctx, params, optFns...)
}

func TestDiscoverVersions(t *testing.T) {
	emptyClient := &FakeClient{
		ListLayerVersionsFn: func(ctx context.Context, params *lambda.ListLayerVersionsInput, optFns ...func(*lambda.Options)) (*lambda.ListLayerVersionsOutput, error) {
			return nil, nil
		},
		GetLayerVersionByArnFn: func(ctx context.Context, params *lambda.GetLayerVersionByArnInput, optFns ...func(*lambda.Options)) (*lambda.GetLayerVersionByArnOutput, error) {
			return nil, nil
		},
		PublishLayerVersionFn: func(ctx context.Context, params *lambda.PublishLayerVersionInput, optFns ...func(*lambda.Options)) (*lambda.PublishLayerVersionOutput, error) {
			return nil, nil
		},
		AddLayerVersionPermissionFn: func(ctx context.Context, params *lambda.AddLayerVersionPermissionInput, optFns ...func(*lambda.Options)) (*lambda.AddLayerVersionPermissionOutput, error) {
			return nil, nil
		},
	}

	items := []types.LayerVersionsListItem{
		{
			LayerVersionArn: awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:78"),
		},
		{
			LayerVersionArn: awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:77"),
		},
		{
			LayerVersionArn: awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:79"),
		},
		{
			LayerVersionArn: awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:80"),
		},
	}

	t.Run("DiscoverVersions", func(t *testing.T) {
		needsMarker := true
		client := emptyClient
		client.ListLayerVersionsFn = func(ctx context.Context, params *lambda.ListLayerVersionsInput, optFns ...func(*lambda.Options)) (*lambda.ListLayerVersionsOutput, error) {
			if needsMarker {
				needsMarker = false
				return &lambda.ListLayerVersionsOutput{
					LayerVersions: items[0:2],
					NextMarker:    awsSDK.String("foobar"),
				}, nil
			}

			return &lambda.ListLayerVersionsOutput{
				LayerVersions: items[2:4],
				NextMarker:    nil,
			}, nil
		}

		out, err := layers.DiscoverVersions(context.TODO(), client, "foo")
		if err != nil {
			t.Errorf("expected no errors: %v", err)
		}

		if len(out) != len(items) {
			t.Errorf("wrong number of items returned, got: %d", len(out))
		}
	})

	t.Run("DiscoverVersions ListLayerVersions Error", func(t *testing.T) {
		needsMarker := true
		client := emptyClient
		client.ListLayerVersionsFn = func(ctx context.Context, params *lambda.ListLayerVersionsInput, optFns ...func(*lambda.Options)) (*lambda.ListLayerVersionsOutput, error) {
			if needsMarker {
				needsMarker = false
				return nil, &smithy.OperationError{
					ServiceID:     "Lambda",
					OperationName: "ListLayerVersions",
				}
			}

			return &lambda.ListLayerVersionsOutput{
				LayerVersions: items[2:4],
				NextMarker:    nil,
			}, nil
		}

		_, err := layers.DiscoverVersions(context.TODO(), client, "foo")
		if err == nil {
			t.Errorf("expected errors")
		} else {
			smithyErr, ok := err.(*smithy.OperationError)
			if ok && smithyErr.Operation() != "ListLayerVersions" {
				t.Errorf("ListLayerVersions expected to fail: %s", err)
			}
		}
	})

	t.Run("DiscoverVersions ListLayerVersions No Versions Error", func(t *testing.T) {
		client := emptyClient
		client.ListLayerVersionsFn = func(ctx context.Context, params *lambda.ListLayerVersionsInput, optFns ...func(*lambda.Options)) (*lambda.ListLayerVersionsOutput, error) {
			return &lambda.ListLayerVersionsOutput{
				LayerVersions: []types.LayerVersionsListItem{},
				NextMarker:    nil,
			}, nil
		}

		_, err := layers.DiscoverVersions(context.TODO(), client, "foo")
		if err == nil {
			t.Errorf("expected errors")
		} else {
			if err != layers.ErrNoVersions {
				t.Errorf("expected no items returned: %v", err)
			}
		}
	})
}

func TestEnrichVersions(t *testing.T) {
	emptyClient := &FakeClient{
		ListLayerVersionsFn: func(ctx context.Context, params *lambda.ListLayerVersionsInput, optFns ...func(*lambda.Options)) (*lambda.ListLayerVersionsOutput, error) {
			return nil, nil
		},
		GetLayerVersionByArnFn: func(ctx context.Context, params *lambda.GetLayerVersionByArnInput, optFns ...func(*lambda.Options)) (*lambda.GetLayerVersionByArnOutput, error) {
			return nil, nil
		},
		PublishLayerVersionFn: func(ctx context.Context, params *lambda.PublishLayerVersionInput, optFns ...func(*lambda.Options)) (*lambda.PublishLayerVersionOutput, error) {
			return nil, nil
		},
		AddLayerVersionPermissionFn: func(ctx context.Context, params *lambda.AddLayerVersionPermissionInput, optFns ...func(*lambda.Options)) (*lambda.AddLayerVersionPermissionOutput, error) {
			return nil, nil
		},
	}

	t.Run("EnrichVersions", func(t *testing.T) {
		client := emptyClient
		client.GetLayerVersionByArnFn = func(ctx context.Context, params *lambda.GetLayerVersionByArnInput, optFns ...func(*lambda.Options)) (*lambda.GetLayerVersionByArnOutput, error) {
			parts := strings.Split(*params.Arn, ":")
			ver, _ := strconv.Atoi(parts[len(parts)-1])
			return &lambda.GetLayerVersionByArnOutput{
				Version: int64(ver),
			}, nil
		}

		out, err := layers.EnrichVersions(context.TODO(), client, []types.LayerVersionsListItem{
			{
				LayerVersionArn: awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:78"),
			},
			{
				LayerVersionArn: awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:77"),
			},
			{
				LayerVersionArn: awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:79"),
			},
		})
		if err != nil {
			t.Errorf("expected to succeed: %v", err)
		}

		if out[1].Version > out[2].Version {
			t.Errorf("items are not ordered")
		}
	})

	t.Run("EnrichVersions GetLayerVersionByArn Error", func(t *testing.T) {
		client := emptyClient
		client.GetLayerVersionByArnFn = func(ctx context.Context, params *lambda.GetLayerVersionByArnInput, optFns ...func(*lambda.Options)) (*lambda.GetLayerVersionByArnOutput, error) {
			return nil, &smithy.OperationError{
				ServiceID:     "Lambda",
				OperationName: "GetLayerVersionByArn",
			}
		}

		_, err := layers.EnrichVersions(context.TODO(), client, []types.LayerVersionsListItem{
			{
				LayerVersionArn: awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:78"),
			},
			{
				LayerVersionArn: awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:77"),
			},
			{
				LayerVersionArn: awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:79"),
			},
		})
		if err == nil {
			t.Errorf("expected to fail")
		} else {
			smithyErr, ok := err.(*smithy.OperationError)
			if ok && smithyErr.Operation() != "GetLayerVersionByArn" {
				t.Errorf("PublishLayerVersion expected to fail: %s", err)
			}
		}
	})
}

func TestDownloadPackage(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		// Send response to be tested
		rw.Write([]byte(`OK`))
	}))
	defer server.Close()

	t.Run("DownloadPackage", func(t *testing.T) {
		out, err := layers.DownloadPackage(context.TODO(), server.URL)
		if err != nil {
			t.Errorf("Expected to succeed: %v", err)
		}

		if string(out) != "OK" {
			t.Errorf("Wrong output")
		}
	})

	t.Run("DownloadPackage Timout", func(t *testing.T) {
		ctx, cancel := context.WithTimeout(context.TODO(), 0)
		defer cancel()

		_, err := layers.DownloadPackage(ctx, server.URL)
		if err != nil {
			uErr, ok := err.(*url.Error)
			if !ok {
				t.Errorf("Expected to timeout: %v", uErr)
			}
		}
	})
}

func TestCopy(t *testing.T) {
	emptyClient := &FakeClient{
		ListLayerVersionsFn: func(ctx context.Context, params *lambda.ListLayerVersionsInput, optFns ...func(*lambda.Options)) (*lambda.ListLayerVersionsOutput, error) {
			return nil, nil
		},
		GetLayerVersionByArnFn: func(ctx context.Context, params *lambda.GetLayerVersionByArnInput, optFns ...func(*lambda.Options)) (*lambda.GetLayerVersionByArnOutput, error) {
			return nil, nil
		},
		PublishLayerVersionFn: func(ctx context.Context, params *lambda.PublishLayerVersionInput, optFns ...func(*lambda.Options)) (*lambda.PublishLayerVersionOutput, error) {
			return nil, nil
		},
		AddLayerVersionPermissionFn: func(ctx context.Context, params *lambda.AddLayerVersionPermissionInput, optFns ...func(*lambda.Options)) (*lambda.AddLayerVersionPermissionOutput, error) {
			return nil, nil
		},
	}

	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		// Send response to be tested
		rw.Write([]byte(`OK`))
	}))
	defer server.Close()

	t.Run("Copy", func(t *testing.T) {
		client := emptyClient
		client.PublishLayerVersionFn = func(ctx context.Context, params *lambda.PublishLayerVersionInput, optFns ...func(*lambda.Options)) (*lambda.PublishLayerVersionOutput, error) {
			return &lambda.PublishLayerVersionOutput{
				Version: 77,
			}, nil
		}
		client.AddLayerVersionPermissionFn = func(ctx context.Context, params *lambda.AddLayerVersionPermissionInput, optFns ...func(*lambda.Options)) (*lambda.AddLayerVersionPermissionOutput, error) {
			return nil, nil
		}

		version := &lambda.GetLayerVersionByArnOutput{
			Description:             awsSDK.String("hello"),
			CompatibleArchitectures: []types.Architecture{types.ArchitectureArm64},
			CompatibleRuntimes:      []types.Runtime{types.RuntimePython312},
			LicenseInfo:             awsSDK.String("some license"),
			LayerArn:                awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:77"),
			Content: &types.LayerVersionContentOutput{
				Location: awsSDK.String(server.URL),
			},
		}

		layers.Copy(context.TODO(), client, "foo", version, false)
	})

	t.Run("Copy Download Fail", func(t *testing.T) {
		client := emptyClient
		client.PublishLayerVersionFn = func(ctx context.Context, params *lambda.PublishLayerVersionInput, optFns ...func(*lambda.Options)) (*lambda.PublishLayerVersionOutput, error) {
			return &lambda.PublishLayerVersionOutput{
				Version: 77,
			}, nil
		}
		client.AddLayerVersionPermissionFn = func(ctx context.Context, params *lambda.AddLayerVersionPermissionInput, optFns ...func(*lambda.Options)) (*lambda.AddLayerVersionPermissionOutput, error) {
			return nil, nil
		}

		version := &lambda.GetLayerVersionByArnOutput{
			Description:             awsSDK.String("hello"),
			CompatibleArchitectures: []types.Architecture{types.ArchitectureArm64},
			CompatibleRuntimes:      []types.Runtime{types.RuntimePython312},
			LicenseInfo:             awsSDK.String("some license"),
			LayerArn:                awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:77"),
			Content: &types.LayerVersionContentOutput{
				Location: awsSDK.String("http://error"),
			},
		}

		if err := layers.Copy(context.TODO(), client, "foo", version, false); err == nil {
			t.Errorf("excepted failure, but none returned")
		} else {
			_, ok := err.(*url.Error)
			if !ok {
				t.Errorf("Download expected to fail: %s", err)
			}
		}
	})

	t.Run("Copy PublishLayerVersion Fail", func(t *testing.T) {
		client := emptyClient
		client.PublishLayerVersionFn = func(ctx context.Context, params *lambda.PublishLayerVersionInput, optFns ...func(*lambda.Options)) (*lambda.PublishLayerVersionOutput, error) {
			return nil, &smithy.OperationError{
				ServiceID:     "Lambda",
				OperationName: "PublishLayerVersion",
			}
		}
		client.AddLayerVersionPermissionFn = func(ctx context.Context, params *lambda.AddLayerVersionPermissionInput, optFns ...func(*lambda.Options)) (*lambda.AddLayerVersionPermissionOutput, error) {
			return nil, nil
		}

		version := &lambda.GetLayerVersionByArnOutput{
			Description:             awsSDK.String("hello"),
			CompatibleArchitectures: []types.Architecture{types.ArchitectureArm64},
			CompatibleRuntimes:      []types.Runtime{types.RuntimePython312},
			LicenseInfo:             awsSDK.String("some license"),
			LayerArn:                awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:77"),
			Content: &types.LayerVersionContentOutput{
				Location: awsSDK.String(server.URL),
			},
		}

		if err := layers.Copy(context.TODO(), client, "foo", version, false); err == nil {
			t.Errorf("excepted failure, but none returned")
		} else {
			smithyErr, ok := err.(*smithy.OperationError)
			if ok && smithyErr.Operation() != "PublishLayerVersion" {
				t.Errorf("PublishLayerVersion expected to fail: %s", err)
			}
		}
	})

	t.Run("Copy AddLayerVersionPermission Fail", func(t *testing.T) {
		client := emptyClient
		client.PublishLayerVersionFn = func(ctx context.Context, params *lambda.PublishLayerVersionInput, optFns ...func(*lambda.Options)) (*lambda.PublishLayerVersionOutput, error) {
			return &lambda.PublishLayerVersionOutput{
				Version: 77,
			}, nil
		}
		client.AddLayerVersionPermissionFn = func(ctx context.Context, params *lambda.AddLayerVersionPermissionInput, optFns ...func(*lambda.Options)) (*lambda.AddLayerVersionPermissionOutput, error) {
			return nil, &smithy.OperationError{
				ServiceID:     "Lambda",
				OperationName: "AddLayerVersionPermission",
			}
		}

		version := &lambda.GetLayerVersionByArnOutput{
			Description:             awsSDK.String("hello"),
			CompatibleArchitectures: []types.Architecture{types.ArchitectureArm64},
			CompatibleRuntimes:      []types.Runtime{types.RuntimePython312},
			LicenseInfo:             awsSDK.String("some license"),
			LayerArn:                awsSDK.String("arn:aws:lambda:region:012345678912:layer:AWSLambdaPowertoolsPythonV2:77"),
			Content: &types.LayerVersionContentOutput{
				Location: awsSDK.String(server.URL),
			},
		}

		if err := layers.Copy(context.TODO(), client, "foo", version, false); err == nil {
			t.Errorf("excepted failure, but none returned")
		} else {
			smithyErr, ok := err.(*smithy.OperationError)
			if ok && smithyErr.Operation() != "AddLayerVersionPermission" {
				t.Errorf("PublishLayerVersion expected to fail: %s", err)
			}
		}
	})
}
