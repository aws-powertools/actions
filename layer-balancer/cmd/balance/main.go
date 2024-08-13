package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/aws-powertools/actions/layer-balancer/config"
	"github.com/aws-powertools/actions/layer-balancer/layers"
)

var (
	dryRun      = flag.Bool("dry-run", true, "explicitly set to false to perform operation")
	readRegion  = flag.String("read-region", "", "known good region with a complete layer history")
	writeRegion = flag.String("write-region", "", "region the new layer will exist in, this doesn't have to be the same account")
	writeRole   = flag.String("write-role", "", "role ARN for write operation, it has to be assumable by your environment role")
	layerName   = flag.String("layer-name", "", "layer name to copy to another region")

	startAt = flag.Int64("start-at", 1, "Layer version to start backfilling from")
)

func main() {
	flag.Usage = usage
	flag.Parse()

	// if flag.NArg() < 5 {
	// 	usage()
	// }

	ctx := context.Background()

	cfg := config.NewConfig(
		config.WithReadRegion(*readRegion),
		config.WithWriteRegion(*writeRegion),
		config.WithWriteRole(*writeRole),
		config.WithStartAt(*startAt),
	)

	cfg.DryRun = *dryRun

	if err := layers.Balance(ctx, cfg, *layerName); err != nil {
		log.Fatal(err)
	}
}

func usage() {
	fmt.Fprintf(os.Stderr, "usage: balance [options] \n\n")
	fmt.Fprintf(os.Stderr, "flags:\n")
	flag.PrintDefaults()
	os.Exit(2)
}
