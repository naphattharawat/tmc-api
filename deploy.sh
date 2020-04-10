docker login registry.gitlab.com \
&& tsc \
&& docker build -t registry.gitlab.com/dev-datacenter/eoc-api . \
&& docker push registry.gitlab.com/dev-datacenter/eoc-api \