package config

type Config struct {
	WriteRegion string
	ReadRegion  string
	WriteRole   string

	StartAt int64

	DryRun bool
}

func NewConfig(opts ...Option) *Config {
	c := &Config{
		DryRun: true,
	}

	for _, opt := range opts {
		opt(c)
	}

	return c
}

type Option func(c *Config)

func WithWriteRegion(region string) Option {
	return func(c *Config) {
		c.WriteRegion = region
	}
}

func WithReadRegion(region string) Option {
	return func(c *Config) {
		c.ReadRegion = region
	}
}

func WithWriteRole(role string) Option {
	return func(c *Config) {
		c.WriteRole = role
	}
}

func WithStartAt(startAt int64) Option {
	return func(c *Config) {
		c.StartAt = startAt
	}
}