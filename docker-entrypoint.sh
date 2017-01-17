#!/bin/sh

set -e

mkdir -p /usr/src/app/public
cp -R /usr/src/app/client/* /usr/src/app/public/

exec "$@"
