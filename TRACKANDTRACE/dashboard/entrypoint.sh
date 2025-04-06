#!/bin/sh

ROOT_DIR=/usr/share/nginx/html

# Replace env vars in JavaScript files
echo "Replacing env constants in TS"
for file in $ROOT_DIR/ts/app.*.ts* $ROOT_DIR/index.html $ROOT_DIR/precache-manifest*.js;
do
  echo "Processing $file ...";

  sed -i 's|VUE_APP_API_BASE_URL|'${VUE_APP_API_BASE_URL}'|g' $file 
  sed -i 's|VUE_APP_CLIENT_ID|'${VUE_APP_CLIENT_ID}'|g' $file

done

echo "Starting Nginx"
nginx -g 'daemon off;'