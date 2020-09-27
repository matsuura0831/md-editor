# frontend

```sh
docker-compose run --rm frontend npm run build
# or npm run watch

aws s3 sync dist/ s3://av.besolab.com/
```