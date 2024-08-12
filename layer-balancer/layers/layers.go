package layers

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"sort"
	"time"

	"github.com/aws-powertools/powertools-lambda-layers/aws"
	"github.com/aws-powertools/powertools-lambda-layers/config"

	awsSDK "github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/aws/aws-sdk-go-v2/service/lambda/types"
)

var (
	ErrNoVersions = errors.New("no layer versions found")
)

// these params are temp and may change eventually
func Balance(ctx context.Context, cfg *config.Config, layerName string) error {
	readClient := lambda.NewFromConfig(aws.NewDefaultClientConfig(ctx, cfg.ReadRegion).SDKConfig())
	writeClient := lambda.NewFromConfig(aws.NewClientConfigWithRole(ctx, cfg.WriteRegion, cfg.WriteRole).SDKConfig())

	log.SetPrefix(fmt.Sprintf("DryRun: %v ", cfg.DryRun))

	originalVersions, err := DiscoverVersions(ctx, readClient, layerName)
	if err != nil {
		return err
	}

	newVersions, err := DiscoverVersions(ctx, writeClient, layerName)
	if err != nil && err != ErrNoVersions {
		return err
	}

	if len(newVersions) > 0 {
		return fmt.Errorf("the new layer shouldn't exist, found %d versions for %s", len(newVersions), layerName)
	}

	enrichedVersions, err := EnrichVersions(ctx, readClient, originalVersions)
	if err != nil {
		return err
	}

	log.Printf("Found %d versions", len(enrichedVersions))

	for _, v := range enrichedVersions {
		log.Printf("Processing: %s", *v.LayerVersionArn)

		if err := Copy(ctx, writeClient, layerName, v, cfg.DryRun); err != nil {
			return err
		}
	}

	return nil
}

func DiscoverVersions(ctx context.Context, client LambdaClient, name string) ([]types.LayerVersionsListItem, error) {
	out, err := client.ListLayerVersions(ctx, &lambda.ListLayerVersionsInput{
		LayerName: awsSDK.String(name),
		MaxItems:  awsSDK.Int32(50),
	})

	if err != nil {
		return nil, err
	}

	if len(out.LayerVersions) == 0 {
		return nil, ErrNoVersions
	}

	var listVersions []types.LayerVersionsListItem
	listVersions = append(listVersions, out.LayerVersions...)

	for out.NextMarker != nil {
		out, err = client.ListLayerVersions(ctx, &lambda.ListLayerVersionsInput{
			LayerName: awsSDK.String(name),
			MaxItems:  awsSDK.Int32(50),
			Marker:    out.NextMarker,
		})

		if err != nil {
			return nil, err
		}

		listVersions = append(listVersions, out.LayerVersions...)
	}

	return listVersions, nil
}

func EnrichVersions(ctx context.Context, client LambdaClient, listVersions []types.LayerVersionsListItem) ([]*lambda.GetLayerVersionByArnOutput, error) {
	var versions []*lambda.GetLayerVersionByArnOutput
	for _, v := range listVersions {
		ctx, cancel := context.WithTimeout(ctx, time.Second*5)
		defer cancel()

		version, err := client.GetLayerVersionByArn(ctx, &lambda.GetLayerVersionByArnInput{
			Arn: v.LayerVersionArn,
		})
		if err != nil {
			return nil, err
		}

		versions = append(versions, version)
	}

	sort.Slice(versions, func(i int, j int) bool {
		return versions[i].Version < versions[j].Version
	})

	return versions, nil
}

func DownloadPackage(ctx context.Context, location string) ([]byte, error) {
	log.Printf("Downloading: %s", location)
	req, err := http.NewRequest("GET", location, nil)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	req = req.WithContext(ctx)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	body, err := io.ReadAll(resp.Body)
	defer resp.Body.Close()
	if err != nil {
		return nil, err
	}

	return body, nil
}

func Copy(ctx context.Context, writeClient LambdaClient, layerName string, version *lambda.GetLayerVersionByArnOutput, dryRun bool) error {
	log.Printf("Copying: %s\n", *version.LayerArn)

	if !dryRun {
		zip, err := DownloadPackage(ctx, *version.Content.Location)
		if err != nil {
			return err
		}

		out, err := writeClient.PublishLayerVersion(ctx, &lambda.PublishLayerVersionInput{
			Content: &types.LayerVersionContentInput{
				ZipFile: zip,
			},
			LayerName:               awsSDK.String(layerName),
			Description:             version.Description,
			CompatibleArchitectures: version.CompatibleArchitectures,
			CompatibleRuntimes:      version.CompatibleRuntimes,
			LicenseInfo:             version.LicenseInfo,
		})

		if err != nil {
			return err
		}
		if _, err = writeClient.AddLayerVersionPermission(ctx, &lambda.AddLayerVersionPermissionInput{
			LayerName:     awsSDK.String(layerName),
			VersionNumber: awsSDK.Int64(out.Version),
			Action:        awsSDK.String("lambda:GetLayerVersion"),
			Principal:     awsSDK.String("*"),
			StatementId:   awsSDK.String("PublicLayerAccess"),
		}); err != nil {
			return err
		}
	}

	return nil
}

type LambdaClient interface {
	ListLayerVersions(ctx context.Context, params *lambda.ListLayerVersionsInput, optFns ...func(*lambda.Options)) (*lambda.ListLayerVersionsOutput, error)
	GetLayerVersionByArn(ctx context.Context, params *lambda.GetLayerVersionByArnInput, optFns ...func(*lambda.Options)) (*lambda.GetLayerVersionByArnOutput, error)
	PublishLayerVersion(ctx context.Context, params *lambda.PublishLayerVersionInput, optFns ...func(*lambda.Options)) (*lambda.PublishLayerVersionOutput, error)
	AddLayerVersionPermission(ctx context.Context, params *lambda.AddLayerVersionPermissionInput, optFns ...func(*lambda.Options)) (*lambda.AddLayerVersionPermissionOutput, error)
}
